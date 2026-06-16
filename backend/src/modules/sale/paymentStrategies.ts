import mongoose from 'mongoose';
import { Sale } from '../../shared/models/sale/sale.model';
import { ApiError } from '../../shared/utils/apiError/ApiError';

export interface PaymentInput {
  tenantId: string;
  customerName?: string;
  paymentMethod: string;
  exchangeFromSaleId?: string;
  exchangeCredit?: number;
  total: number;
}

export interface PaymentStrategy {
  readonly paymentMethod: string;
  validate(input: PaymentInput, session?: mongoose.ClientSession): Promise<void>;
  getSaleFields(input: PaymentInput): Record<string, any>;
  determineFinalMethod(input: PaymentInput, total: number): string;
}

class CashStrategy implements PaymentStrategy {
  readonly paymentMethod = 'cash';

  async validate(_input: PaymentInput): Promise<void> {
    // no special validation for cash
  }

  getSaleFields(_input: PaymentInput): Record<string, any> {
    return {};
  }

  determineFinalMethod(_input: PaymentInput, _total: number): string {
    return 'cash';
  }
}

class CardStrategy implements PaymentStrategy {
  readonly paymentMethod = 'card';

  async validate(_input: PaymentInput): Promise<void> {
    // card validation (if needed) goes here
  }

  getSaleFields(input: PaymentInput): Record<string, any> {
    return {};
  }

  determineFinalMethod(_input: PaymentInput, _total: number): string {
    return 'card';
  }
}

class TransferStrategy implements PaymentStrategy {
  readonly paymentMethod = 'transfer';

  async validate(_input: PaymentInput): Promise<void> {
    // transfer validation (if needed) goes here
  }

  getSaleFields(input: PaymentInput): Record<string, any> {
    return {};
  }

  determineFinalMethod(_input: PaymentInput, _total: number): string {
    return 'transfer';
  }
}

class ExchangeStrategy implements PaymentStrategy {
  readonly paymentMethod = 'exchange';

  async validate(input: PaymentInput, session?: mongoose.ClientSession): Promise<void> {
    if (!input.exchangeFromSaleId) {
      throw ApiError.badRequest('Se requiere una venta original para el intercambio');
    }

    const originalSale = await Sale.findOne({
      _id: input.exchangeFromSaleId,
      tenantId: input.tenantId,
    }).session(session || null);

    if (!originalSale) throw ApiError.notFound('Venta original no encontrada');
    if (originalSale.status !== 'refunded')
      throw ApiError.badRequest('La venta original debe estar devuelta antes de hacer un intercambio');

    const usedAgg = await Sale.aggregate([
      { $match: { exchangeFromSaleId: originalSale._id, tenantId: new mongoose.Types.ObjectId(input.tenantId) } },
      { $group: { _id: null, total: { $sum: '$exchangeCredit' } } },
    ]).allowDiskUse(true).session(session || null);
    const usedCredit = usedAgg[0]?.total || 0;
    const availableCredit = originalSale.total - usedCredit;

    if (availableCredit <= 0)
      throw ApiError.badRequest('Esta venta ya fue intercambiada completamente y no tiene crédito disponible');

    if ((input.exchangeCredit || 0) > availableCredit)
      throw ApiError.badRequest(
        `Crédito insuficiente. Disponible: $${availableCredit.toLocaleString('es-CO')}`
      );

    if (originalSale.customerName && input.customerName?.toLowerCase() !== originalSale.customerName.toLowerCase())
      throw ApiError.badRequest(
        `El cliente debe ser "${originalSale.customerName}" (coincidir con la venta original)`
      );

    if (input.total < availableCredit)
      throw ApiError.badRequest('El total de la venta debe ser mayor o igual al crédito disponible');

    if (input.total > (input.exchangeCredit || 0)) {
      if (input.paymentMethod === 'exchange') {
        throw ApiError.badRequest(
          `El excedente de $${(input.total - (input.exchangeCredit || 0)).toLocaleString('es-CO')} requiere un método de pago`
        );
      }
    }
  }

  getSaleFields(input: PaymentInput): Record<string, any> {
    return {
      exchangeFromSaleId: input.exchangeFromSaleId,
      exchangeCredit: input.exchangeCredit || 0,
    };
  }

  determineFinalMethod(input: PaymentInput, total: number): string {
    return input.exchangeFromSaleId && total <= (input.exchangeCredit || 0) ? 'exchange' : (input.paymentMethod || 'exchange');
  }
}

class PaymentStrategyContext {
  private strategies = new Map<string, PaymentStrategy>();

  constructor() {
    this.register(new CashStrategy());
    this.register(new CardStrategy());
    this.register(new TransferStrategy());
    this.register(new ExchangeStrategy());
  }

  register(strategy: PaymentStrategy): void {
    this.strategies.set(strategy.paymentMethod, strategy);
  }

  get(method: string): PaymentStrategy {
    const strategy = this.strategies.get(method);
    if (!strategy) {
      throw ApiError.badRequest(`Método de pago no soportado: ${method}`);
    }
    return strategy;
  }
}

export const paymentContext = new PaymentStrategyContext();
