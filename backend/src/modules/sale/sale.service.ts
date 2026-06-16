import mongoose from 'mongoose';
import { Sale } from '../../shared/models/sale/sale.model';
import { CashierShift } from '../../shared/models';
import Product from '../../shared/models/product/product.model';
import Stock from '../../shared/models/stock/stock.model';
import User from '../../shared/models/user/user.model';
import * as customerService from '../customer/customer.service';
import { moveStock } from '../stock/stock.service';
import { generateSaleNumber } from '../../shared/utils/sequenceGenerator/sequenceGenerator';
import { ApiError } from '../../shared/utils/apiError/ApiError';
import { eventBus, Events } from '../../shared/utils/eventBus';
import { paymentContext } from './paymentStrategies';
import type { PaymentInput } from './paymentStrategies';
import { saleStateMachine } from './saleStateMachine';

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
      input.tenantId, input.customerName, input.customerPhone
    );
    if (existing) {
      customerId = existing._id.toString();
    } else {
      const newCustomer = await customerService.createCustomer({
        tenantId: input.tenantId,
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

  let preSubtotal = 0;
  for (const item of input.items) {
    preSubtotal += item.quantity * item.unitPrice;
  }
  const preTax = input.tax || 0;
  const preDiscount = input.discount || 0;
  const preTotal = preSubtotal + preTax - preDiscount;

  const strategy = paymentContext.get(input.paymentMethod);
  const paymentInput: PaymentInput = {
    tenantId: input.tenantId,
    customerName: input.customerName,
    paymentMethod: input.paymentMethod,
    exchangeFromSaleId: input.exchangeFromSaleId,
    exchangeCredit: input.exchangeCredit,
    total: preTotal,
  };

  // payment-specific validation (exchange, etc.)
  await strategy.validate(paymentInput);

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const saleNumber = await generateSaleNumber(input.tenantId);

    let subtotal = 0;
    const saleItems: any[] = [];
    let maxAllowedDiscountAmount = 0;

    for (const item of input.items) {
      const product = await Product.findOne({
        _id: item.productId,
        tenantId: input.tenantId,
      }).session(session);

      if (!product) {
        throw ApiError.notFound(`Product not found: ${item.productId}`);
      }

      const validPrices: number[] = [product.price];
      if (product.wholesalePrice != null) validPrices.push(product.wholesalePrice);
      if (product.specialPrice != null) validPrices.push(product.specialPrice);

      const priceMatch = validPrices.some(p => Math.abs(item.unitPrice - p) < 0.01);
      if (!priceMatch) {
        throw ApiError.badRequest(
          `Precio inválido para "${product.name}". Esperado: ${validPrices.map(p => `$${p.toLocaleString('es-CO')}`).join(' / ')}`
        );
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

      if (product.allowsDiscount && product.maxDiscount && product.maxDiscount > 0) {
        const itemWithTax = itemTotal + (product.applyTax && product.taxPercentage
          ? itemTotal * (product.taxPercentage / 100) : 0);
        maxAllowedDiscountAmount += itemWithTax * (product.maxDiscount / 100);
      }

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

    if (Math.abs(total - preTotal) > 0.01) {
      throw ApiError.badRequest('Error al calcular el total de la venta. Intenta de nuevo.');
    }

    if (discount > Math.round(maxAllowedDiscountAmount)) {
      throw ApiError.badRequest(
        `El descuento ($${discount.toLocaleString('es-CO')}) excede el máximo permitido ($${Math.round(maxAllowedDiscountAmount).toLocaleString('es-CO')})`
      );
    }

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
      paymentMethod: strategy.determineFinalMethod(paymentInput, total),
      status: 'completed',
      transferReference: input.transferReference,
      transferAmount: input.transferAmount,
      transferBank: input.transferBank,
      cardBank: input.cardBank,
      cardReference: input.cardReference,
      ...strategy.getSaleFields(paymentInput),
    });

    await sale.save({ session });
    await session.commitTransaction();
    session.endSession();

    eventBus.emit(Events.SALE_CREATED, {
      saleId: sale._id.toString(),
      saleNumber,
      tenantId: input.tenantId,
      branchId: input.branchId,
      userId: input.userId,
      customerId,
      customerName: input.customerName,
      total,
      paymentMethod: sale.paymentMethod,
      items: saleItems.map(i => ({ productId: i.productId, quantity: i.quantity, unitPrice: i.unitPrice })),
    });

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
  if (customerName) {
    const escapedCustomerName = customerName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    query.customerName = { $regex: escapedCustomerName, $options: 'i' };
  }
  if (userId) query.userId = userId;

  if (search) {
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    query.$or = [
      { saleNumber: { $regex: escaped, $options: 'i' } },
      { customerName: { $regex: escaped, $options: 'i' } },
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

interface SalesSummaryFilters {
  branchId?: string;
  startDate?: Date;
  endDate?: Date;
  status?: string;
  paymentMethod?: string;
  customerName?: string;
  userId?: string;
  search?: string;
  minTotal?: number;
  maxTotal?: number;
}

export const getSalesSummary = async (tenantId: string, filters?: SalesSummaryFilters) => {
  const { branchId, startDate, endDate, status, paymentMethod, customerName, userId, search, minTotal, maxTotal } = filters || {};

  const today = startDate || new Date();
  if (!startDate) today.setHours(0, 0, 0, 0);
  const endOfToday = endDate || new Date();
  if (!endDate) endOfToday.setHours(23, 59, 59, 999);

  const match: any = {
    tenantId: new mongoose.Types.ObjectId(tenantId),
    createdAt: { $gte: today, $lte: endOfToday },
  };

  if (branchId) {
    match.branchId = new mongoose.Types.ObjectId(branchId);
  }

  if (paymentMethod) match.paymentMethod = paymentMethod;
  if (customerName) {
    const escapedCustomerName = customerName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    match.customerName = { $regex: escapedCustomerName, $options: 'i' };
  }
  if (userId) match.userId = new mongoose.Types.ObjectId(userId);

  if (search) {
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    match.$or = [
      { saleNumber: { $regex: escaped, $options: 'i' } },
      { customerName: { $regex: escaped, $options: 'i' } },
    ];
  }

  if (minTotal !== undefined || maxTotal !== undefined) {
    match.total = {};
    if (minTotal !== undefined) match.total.$gte = minTotal;
    if (maxTotal !== undefined) match.total.$lte = maxTotal;
  }

  const matchCompleted = { ...match, status: 'completed' };
  const matchRefunded = { ...match, status: 'refunded' };
  const matchCancelledOrRefunded = { ...match, status: { $in: ['cancelled', 'refunded'] } };

  const [[salesToday, cancelledCount, totalAgg, productAgg, paymentAgg, profitAgg], refundedSales, exchangeRefundIds] = await Promise.all([
    Promise.all([
      Sale.countDocuments(matchCompleted),
      Sale.countDocuments(matchCancelledOrRefunded),
      Sale.aggregate([
        { $match: matchCompleted },
        { $addFields: { effectiveTotal: { $subtract: ['$total', { $ifNull: ['$exchangeCredit', 0] }] } } },
        { $group: { _id: null, totalRevenue: { $sum: '$effectiveTotal' }, totalSales: { $sum: 1 } } },
      ]).allowDiskUse(true),
      Sale.aggregate([
        { $match: matchCompleted },
        { $unwind: '$items' },
        { $group: { _id: null, totalProducts: { $sum: '$items.quantity' } } },
      ]).allowDiskUse(true),
      Sale.aggregate([
        { $match: matchCompleted },
        { $addFields: { effectiveTotal: { $subtract: ['$total', { $ifNull: ['$exchangeCredit', 0] }] } } },
        { $group: { _id: '$paymentMethod', total: { $sum: '$effectiveTotal' }, count: { $sum: 1 } } },
      ]).allowDiskUse(true),
      Sale.aggregate([
        { $match: matchCompleted },
        { $unwind: '$items' },
        { $group: { _id: null, totalCost: { $sum: { $multiply: ['$items.quantity', '$items.costPrice'] } } } },
      ]).allowDiskUse(true),
    ]),
    Sale.find(matchRefunded).lean(),
    Sale.distinct('exchangeFromSaleId', {
      exchangeFromSaleId: { $ne: null },
      ...matchCompleted,
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

  const userIds = [...new Set(sales.map(s => s.userId.toString()))];
  const users = await User.find({ _id: { $in: userIds } }).select('firstName lastName');
  const userMap = new Map(users.map(u => [u._id.toString(), `${u.firstName} ${u.lastName}`]));

  return sales.map(s => {
    const obj = s.toObject ? s.toObject() : s;
    obj.userName = userMap.get(s.userId.toString()) || s.userId.toString();
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
    saleObj.userName = user ? `${user.firstName} ${user.lastName}` : sale.userId.toString();
  } catch {
    saleObj.userName = sale.userId.toString();
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
    saleObj.userName = user ? `${user.firstName} ${user.lastName}` : sale.userId.toString();
  } catch {
    saleObj.userName = sale.userId.toString();
  }

  const usedAgg = await Sale.aggregate([
    { $match: { exchangeFromSaleId: sale._id, tenantId: new mongoose.Types.ObjectId(tenantId) } },
    { $group: { _id: null, total: { $sum: '$exchangeCredit' } } },
  ]).allowDiskUse(true);
  const usedCredit = usedAgg[0]?.total || 0;
  saleObj.availableExchangeCredit = sale.total - usedCredit;

  return saleObj as any;
};

export const getTransferSales = async (tenantId: string, branchId?: string, page: number = 1, limit: number = 20) => {
  const query: any = { tenantId, paymentMethod: 'transfer' };
  if (branchId) query.branchId = branchId;

  const [total, sales] = await Promise.all([
    Sale.countDocuments(query),
    Sale.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
  ]);

  const enriched = await enrichWithUserNames(sales);
  return { data: enriched, meta: { total, page, limit } };
};

export const refundSale = async (saleId: string, tenantId: string, branchId: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const query: any = { _id: saleId, tenantId };
    if (branchId) query.branchId = branchId;
    const sale = await Sale.findOne(query).session(session);
    if (!sale) throw ApiError.notFound('Sale not found');
    if (!saleStateMachine.canRefund(sale.status as any)) {
      throw ApiError.badRequest(`No se puede devolver una venta en estado "${sale.status}"`);
    }

    for (const item of sale.items) {
      await moveStock({
        tenantId,
        branchId,
        productId: item.productId.toString(),
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

    eventBus.emit(Events.SALE_REFUNDED, {
      saleId: sale._id.toString(),
      saleNumber: sale.saleNumber,
      tenantId,
      branchId,
      total: sale.total,
    });

    return sale;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};
