import mongoose from 'mongoose';
import { Sale } from '../models/sale.model';
import { CashierShift } from '../models';
import Product from '../models/product.model';
import Stock from '../models/stock.model';
import User from '../models/user.model';
import * as customerService from './customer.service';
import { moveStock } from './stock.service';
import { generateSaleNumber } from '../utils/sequenceGenerator';
import { ApiError } from '../utils/ApiError';

interface SaleItemInput {
  productId: string;
  quantity: number;
  unitPrice: number;
}

interface CreateSaleInput {
  tenantId: string;
  branchId: string;
  userId: string;
  customerName?: string;
  customerPhone?: string;
  items: SaleItemInput[];
  tax?: number;
  discount?: number;
  paymentMethod: 'cash' | 'card' | 'transfer' | 'exchange';
  transferReference?: string;
  transferAmount?: number;
  transferBank?: string;
  cardBank?: string;
  cardReference?: string;
  exchangeFromSaleId?: string;
  exchangeCredit?: number;
}

interface GetSalesFilters {
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
  status?: string;
  paymentMethod?: string;
  customerName?: string;
  userId?: string;
  search?: string;
  minTotal?: number;
  maxTotal?: number;
}

export const createSale = async (input: CreateSaleInput) => {
  let customerId: string | undefined;

  if (input.customerName) {
    const existing = await customerService.findCustomerByNamePhone(
      input.tenantId, input.customerName, input.branchId, input.customerPhone
    );
    if (existing) {
      customerId = existing._id.toString();
    } else {
      const newCustomer = await customerService.createCustomer({
        tenantId: input.tenantId,
        branchId: input.branchId,
        name: input.customerName,
        phone: input.customerPhone,
      });
      customerId = newCustomer._id.toString();
    }
  }

  const openShift = await CashierShift.findOne({
    tenantId: input.tenantId,
    branchId: input.branchId,
    status: 'open',
  });
  if (!openShift) {
    throw ApiError.badRequest('No hay una caja abierta. Debe abrir la caja antes de realizar ventas.');
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const saleNumber = await generateSaleNumber(input.tenantId);

    let preSubtotal = 0;
    for (const item of input.items) {
      preSubtotal += item.quantity * item.unitPrice;
    }
    const preTax = input.tax || 0;
    const preDiscount = input.discount || 0;
    const preTotal = preSubtotal + preTax - preDiscount;

    if (input.exchangeFromSaleId) {
      const originalSale = await Sale.findOne({
        _id: input.exchangeFromSaleId,
        tenantId: input.tenantId,
      }).session(session);

      if (!originalSale) throw ApiError.notFound('Venta original no encontrada');
      if (originalSale.status !== 'refunded')
        throw ApiError.badRequest('La venta original debe estar devuelta antes de hacer un intercambio');

      const usedAgg = await Sale.aggregate([
        { $match: { exchangeFromSaleId: originalSale._id, tenantId: input.tenantId } },
        { $group: { _id: null, total: { $sum: '$exchangeCredit' } } },
      ]).session(session);
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

      if (preTotal < availableCredit)
        throw ApiError.badRequest('El total de la venta debe ser mayor o igual al crédito disponible');

      if (preTotal > (input.exchangeCredit || 0)) {
        if (!input.paymentMethod || input.paymentMethod === 'exchange') {
          throw ApiError.badRequest(
            `El excedente de $${(preTotal - (input.exchangeCredit || 0)).toLocaleString('es-CO')} requiere un método de pago`
          );
        }
      }
    }

    let subtotal = 0;
    const saleItems: any[] = [];

    for (const item of input.items) {
      const product = await Product.findOne({
        _id: item.productId,
        tenantId: input.tenantId,
      }).session(session);

      if (!product) {
        throw ApiError.notFound(`Product not found: ${item.productId}`);
      }

      const stock = await Stock.findOne({
        tenantId: input.tenantId,
        branchId: input.branchId,
        productId: item.productId,
      }).session(session);

      if (!stock || stock.quantity < item.quantity) {
        throw ApiError.badRequest(`Insufficient stock for product: ${product.name}`);
      }

      const itemTotal = item.quantity * item.unitPrice;
      subtotal += itemTotal;

      saleItems.push({
        productId: item.productId,
        productName: product.name,
        sku: product.sku,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        costPrice: product.costPrice,
        total: itemTotal,
      });

      await moveStock({
        tenantId: input.tenantId,
        branchId: input.branchId,
        productId: item.productId,
        type: 'sale',
        quantity: item.quantity,
        referenceId: saleNumber,
        session,
      });
    }

    const tax = input.tax || 0;
    const discount = input.discount || 0;
    const total = subtotal + tax - discount;

    const sale = new Sale({
      tenantId: input.tenantId,
      saleNumber,
      branchId: input.branchId,
      userId: input.userId,
      customerId,
      customerName: input.customerName,
      items: saleItems,
      subtotal,
      tax,
      discount,
      total,
      paymentMethod: input.exchangeFromSaleId && total <= (input.exchangeCredit || 0) ? 'exchange' : input.paymentMethod,
      status: 'completed',
      transferReference: input.transferReference,
      transferAmount: input.transferAmount,
      transferBank: input.transferBank,
      cardBank: input.cardBank,
      cardReference: input.cardReference,
      exchangeFromSaleId: input.exchangeFromSaleId,
      exchangeCredit: input.exchangeCredit || 0,
    });

    await sale.save({ session });
    await session.commitTransaction();
    session.endSession();

    if (customerId) {
      customerService.recordPurchase(customerId, input.tenantId, total).catch(() => {});
    }

    return sale;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const getSales = async (
  tenantId: string,
  branchId: string | undefined,
  filters: GetSalesFilters
) => {
  const {
    startDate, endDate, page = 1, limit = 20,
    status, paymentMethod, customerName, userId,
    search, minTotal, maxTotal,
  } = filters;
  const query: any = { tenantId };
  if (branchId) query.branchId = branchId;

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = startDate;
    if (endDate) query.createdAt.$lte = endDate;
  }

  if (status) query.status = status;
  if (paymentMethod) query.paymentMethod = paymentMethod;
  if (customerName) query.customerName = { $regex: customerName, $options: 'i' };
  if (userId) query.userId = userId;

  if (search) {
    query.$or = [
      { saleNumber: { $regex: search, $options: 'i' } },
      { customerName: { $regex: search, $options: 'i' } },
    ];
  }

  if (minTotal !== undefined || maxTotal !== undefined) {
    query.total = {};
    if (minTotal !== undefined) query.total.$gte = minTotal;
    if (maxTotal !== undefined) query.total.$lte = maxTotal;
  }

  const total = await Sale.countDocuments(query);
  const sales = await Sale.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const enrichedSales = await enrichWithUserNames(sales);

  return { data: enrichedSales, meta: { total, page, limit } };
};

export const getSalesSummary = async (tenantId: string, branchId?: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const matchToday: any = {
    tenantId,
    createdAt: { $gte: today, $lte: endOfToday },
  };
  if (branchId) {
    matchToday.branchId = branchId;
  }

  const [[salesToday, cancelledCount, totalAgg, productAgg, paymentAgg, profitAgg], refundedSales, exchangeRefundIds] = await Promise.all([
    Promise.all([
      Sale.countDocuments({ ...matchToday, status: 'completed' }),
      Sale.countDocuments({ ...matchToday, status: { $in: ['cancelled', 'refunded'] } }),
      Sale.aggregate([
        { $match: { ...matchToday, status: 'completed' } },
        { $addFields: { effectiveTotal: { $subtract: ['$total', { $ifNull: ['$exchangeCredit', 0] }] } } },
        { $group: { _id: null, totalRevenue: { $sum: '$effectiveTotal' }, totalSales: { $sum: 1 } } },
      ]),
      Sale.aggregate([
        { $match: { ...matchToday, status: 'completed' } },
        { $unwind: '$items' },
        { $group: { _id: null, totalProducts: { $sum: '$items.quantity' } } },
      ]),
      Sale.aggregate([
        { $match: { ...matchToday, status: 'completed' } },
        { $addFields: { effectiveTotal: { $subtract: ['$total', { $ifNull: ['$exchangeCredit', 0] }] } } },
        { $group: { _id: '$paymentMethod', total: { $sum: '$effectiveTotal' }, count: { $sum: 1 } } },
      ]),
      Sale.aggregate([
        { $match: { ...matchToday, status: 'completed' } },
        { $unwind: '$items' },
        { $group: { _id: null, totalCost: { $sum: { $multiply: ['$items.quantity', '$items.costPrice'] } } } },
      ]),
    ]),
    Sale.find({ ...matchToday, status: 'refunded' }).lean(),
    Sale.distinct('exchangeFromSaleId', {
      exchangeFromSaleId: { $ne: null },
      ...matchToday,
      status: 'completed',
    }),
  ]);

  // Compute refund adjustments:
  // - Exchange-paired refunds: only reverse cost (revenue already handled via exchangeCredit)
  // - Standalone refunds: reverse BOTH revenue and cost
  const exchangeRefundIdSet = new Set(exchangeRefundIds.map((id: any) => id.toString()));
  let refundedRevenue = 0;
  let refundedCost = 0;
  for (const sale of refundedSales) {
    const isExchangePaired = exchangeRefundIdSet.has(sale._id.toString());
    if (!isExchangePaired) {
      refundedRevenue += sale.total;
    }
    for (const item of sale.items) {
      refundedCost += item.quantity * item.costPrice;
    }
  }

  const completedRevenue = totalAgg[0]?.totalRevenue || 0;
  const totalSalesCount = totalAgg[0]?.totalSales || 0;
  const totalProductsSold = productAgg[0]?.totalProducts || 0;
  const avgTicket = totalSalesCount > 0 ? Math.round(completedRevenue / totalSalesCount) : 0;
  const completedCost = profitAgg[0]?.totalCost || 0;

  const totalRevenue = completedRevenue - refundedRevenue;
  const totalCost = completedCost - refundedCost;
  const totalProfit = totalRevenue - totalCost;

  const cashTotal = paymentAgg.find((p: any) => p._id === 'cash')?.total || 0;
  const cardTotal = paymentAgg.find((p: any) => p._id === 'card')?.total || 0;
  const transferTotal = paymentAgg.find((p: any) => p._id === 'transfer')?.total || 0;
  const cashCount = paymentAgg.find((p: any) => p._id === 'cash')?.count || 0;
  const cardCount = paymentAgg.find((p: any) => p._id === 'card')?.count || 0;
  const transferCount = paymentAgg.find((p: any) => p._id === 'transfer')?.count || 0;

  return {
    salesToday,
    totalRevenue,
    avgTicket,
    cancelledCount,
    totalProductsSold,
    totalProfit,
    totalCost,
    cashTotal,
    cashCount,
    cardTotal,
    cardCount,
    transferTotal,
    transferCount,
  };
};

const enrichWithUserNames = async (sales: any[]) => {
  if (sales.length === 0) return [];

  const userIds = [...new Set(sales.map(s => s.userId))];
  const users = await User.find({ _id: { $in: userIds } }).select('firstName lastName');
  const userMap = new Map(users.map(u => [u._id.toString(), `${u.firstName} ${u.lastName}`]));

  return sales.map(s => {
    const obj = s.toObject ? s.toObject() : s;
    obj.userName = userMap.get(s.userId) || s.userId;
    return obj;
  });
};

export const getSaleById = async (saleId: string, tenantId: string, branchId?: string) => {
  const query: any = { _id: saleId, tenantId };
  if (branchId) query.branchId = branchId;
  const sale = await Sale.findOne(query);
  if (!sale) throw ApiError.notFound('Sale not found');

  const saleObj = sale.toObject() as Record<string, any>;
  try {
    const user = await User.findById(sale.userId).select('firstName lastName');
    saleObj.userName = user ? `${user.firstName} ${user.lastName}` : sale.userId;
  } catch {
    saleObj.userName = sale.userId;
  }

  return saleObj as any;
};

export const getSaleByNumber = async (saleNumber: string, tenantId: string, branchId?: string) => {
  const query: any = { saleNumber, tenantId, status: 'refunded' };
  if (branchId) query.branchId = branchId;
  const sale = await Sale.findOne(query);
  if (!sale) throw ApiError.notFound('Sale not found or not refunded');

  const saleObj = sale.toObject() as Record<string, any>;
  try {
    const user = await User.findById(sale.userId).select('firstName lastName');
    saleObj.userName = user ? `${user.firstName} ${user.lastName}` : sale.userId;
  } catch {
    saleObj.userName = sale.userId;
  }

  const usedAgg = await Sale.aggregate([
    { $match: { exchangeFromSaleId: sale._id.toString(), tenantId } },
    { $group: { _id: null, total: { $sum: '$exchangeCredit' } } },
  ]);
  const usedCredit = usedAgg[0]?.total || 0;
  saleObj.availableExchangeCredit = sale.total - usedCredit;

  return saleObj as any;
};

export const getTransferSales = async (tenantId: string, branchId?: string) => {
  const query: any = { tenantId, paymentMethod: 'transfer' };
  if (branchId) query.branchId = branchId;

  const sales = await Sale.find(query).sort({ createdAt: -1 }).lean();
  const enriched = await enrichWithUserNames(sales);
  return enriched;
};

export const refundSale = async (saleId: string, tenantId: string, branchId: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const query: any = { _id: saleId, tenantId };
    if (branchId) query.branchId = branchId;
    const sale = await Sale.findOne(query).session(session);
    if (!sale) throw ApiError.notFound('Sale not found');
    if (sale.status !== 'completed') throw ApiError.badRequest('Only completed sales can be refunded');

    for (const item of sale.items) {
      await moveStock({
        tenantId,
        branchId,
        productId: item.productId,
        type: 'return',
        quantity: item.quantity,
        note: `Refund of sale ${sale.saleNumber}`,
        referenceId: sale.saleNumber,
        session,
      });
    }

    sale.status = 'refunded';
    await sale.save({ session });
    await session.commitTransaction();
    session.endSession();

    return sale;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};
