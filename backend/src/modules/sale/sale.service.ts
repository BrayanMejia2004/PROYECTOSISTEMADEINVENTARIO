import mongoose from 'mongoose';
import { Sale } from '../../shared/models/sale/sale.model';
import CashierShift from '../../shared/models/cashierShift/cashierShift.model';
import Product from '../../shared/models/product/product.model';
import Stock from '../../shared/models/stock/stock.model';
import User from '../../shared/models/user/user.model';
import * as customerService from '../customer/customer.service';
import { moveStock } from '../stock/stock.service';
import { generateSaleNumber } from '../../shared/utils/sequenceGenerator/sequenceGenerator';
import { ApiError } from '../../shared/utils/apiError/ApiError';
import { eventBus, Events } from '../../shared/utils/eventBus';
import { logger } from '../../config/logger/logger';
import { paymentContext } from './paymentStrategies';
import type { PaymentInput } from './paymentStrategies';
import { saleStateMachine } from './saleStateMachine';
import type { CreateSaleInput, GetSalesFilters, SaleItemInput } from './sale.types';
import type { PaymentMethodAggregation } from '../../shared/types/queries';

const findOrCreateCustomer = async (input: CreateSaleInput): Promise<string | undefined> => {
  if (!input.customerName) return undefined;
  const existing = await customerService.findCustomerByNamePhone(
    input.tenantId, input.customerName, input.customerPhone
  );
  if (existing) return existing._id.toString();
  const newCustomer = await customerService.createCustomer({
    tenantId: input.tenantId,
    name: input.customerName,
    phone: input.customerPhone,
  });
  return newCustomer._id.toString();
};

const validateOpenShift = async (tenantId: string, branchId: string): Promise<void> => {
  const openShift = await CashierShift.findOne({ tenantId, branchId, status: 'open' });
  if (!openShift) {
    throw ApiError.badRequest('No hay una caja abierta. Debe abrir la caja antes de realizar ventas.');
  }
};

interface ProcessedItems {
  saleItems: any[];
  subtotal: number;
  maxAllowedDiscountAmount: number;
}

const processSaleItems = async (
  items: SaleItemInput[],
  tenantId: string,
  branchId: string,
  saleNumber: string,
  session: mongoose.ClientSession
): Promise<ProcessedItems> => {
  let subtotal = 0;
  const saleItems: any[] = [];
  let maxAllowedDiscountAmount = 0;

  for (const item of items) {
    const product = await Product.findOne({ _id: item.productId, tenantId }).session(session);
    if (!product) throw ApiError.notFound(`Product not found: ${item.productId}`);

    const validPrices: number[] = [product.price];
    if (product.wholesalePrice != null) validPrices.push(product.wholesalePrice);
    if (product.specialPrice != null) validPrices.push(product.specialPrice);

    const priceMatch = validPrices.some(p => Math.abs(item.unitPrice - p) < 0.01);
    if (!priceMatch) {
      throw ApiError.badRequest(
        `Precio inválido para "${product.name}". Esperado: ${validPrices.map(p => `$${p.toLocaleString('es-CO')}`).join(' / ')}`
      );
    }

    const stock = await Stock.findOne({ tenantId, branchId, productId: item.productId }).session(session);
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

    await moveStock({ tenantId, branchId, productId: item.productId, type: 'sale', quantity: item.quantity, referenceId: saleNumber, session });
  }

  return { saleItems, subtotal, maxAllowedDiscountAmount };
};

export const createSale = async (input: CreateSaleInput) => {
  const customerId = await findOrCreateCustomer(input);
  await validateOpenShift(input.tenantId, input.branchId);

  const preSubtotal = input.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const preTotal = preSubtotal + (input.tax || 0) - (input.discount || 0);

  const strategy = paymentContext.get(input.paymentMethod);
  const paymentInput: PaymentInput = {
    tenantId: input.tenantId,
    customerName: input.customerName,
    paymentMethod: input.paymentMethod,
    exchangeFromSaleId: input.exchangeFromSaleId,
    exchangeCredit: input.exchangeCredit,
    total: preTotal,
  };
  await strategy.validate(paymentInput);

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const saleNumber = await generateSaleNumber(input.tenantId);
    const { saleItems, subtotal, maxAllowedDiscountAmount } = await processSaleItems(
      input.items, input.tenantId, input.branchId, saleNumber, session
    );

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
      subtotal, tax, discount, total,
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

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildCommonFilters = (
  params: {
    branchId?: string;
    status?: string;
    paymentMethod?: string;
    customerName?: string;
    userId?: string;
    search?: string;
    minTotal?: number;
    maxTotal?: number;
  },
  toId: (id: string) => any = (id) => id
): Record<string, any> => {
  const query: Record<string, any> = {};
  if (params.branchId) query.branchId = toId(params.branchId);
  if (params.status) query.status = params.status;
  if (params.paymentMethod) query.paymentMethod = params.paymentMethod;
  if (params.userId) query.userId = toId(params.userId);
  if (params.customerName) {
    query.customerName = { $regex: escapeRegex(params.customerName), $options: 'i' };
  }
  if (params.search) {
    const escaped = escapeRegex(params.search);
    query.$or = [
      { saleNumber: { $regex: escaped, $options: 'i' } },
      { customerName: { $regex: escaped, $options: 'i' } },
    ];
  }
  if (params.minTotal !== undefined || params.maxTotal !== undefined) {
    query.total = {};
    if (params.minTotal !== undefined) query.total.$gte = params.minTotal;
    if (params.maxTotal !== undefined) query.total.$lte = params.maxTotal;
  }
  return query;
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
  const query: Record<string, any> = { tenantId };

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = startDate;
    if (endDate) query.createdAt.$lte = endDate;
  }

  Object.assign(query, buildCommonFilters({ branchId, status, paymentMethod, customerName, userId, search, minTotal, maxTotal }));

  const total = await Sale.countDocuments(query);
  const sales = await Sale.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const enrichedSales = await enrichWithUserNames(sales);

  return { data: enrichedSales, meta: { total, page, limit } };
};

import type { SalesSummaryFilters } from './sale.types';

const buildSummaryMatch = (tenantId: string, filters?: SalesSummaryFilters) => {
  const { branchId, startDate, endDate, paymentMethod, customerName, userId, search, minTotal, maxTotal } = filters || {};

  const today = startDate || new Date();
  if (!startDate) today.setHours(0, 0, 0, 0);
  const endOfToday = endDate || new Date();
  if (!endDate) endOfToday.setHours(23, 59, 59, 999);

  const toId = (id: string) => new mongoose.Types.ObjectId(id);

  const match: Record<string, any> = {
    tenantId: toId(tenantId),
    createdAt: { $gte: today, $lte: endOfToday },
  };

  Object.assign(match, buildCommonFilters({ branchId, paymentMethod, customerName, userId, search, minTotal, maxTotal }, toId));

  return match;
};

const runSalesAggregations = async (matchCompleted: Record<string, any>, matchRefunded: Record<string, any>, matchCancelledOrRefunded: Record<string, any>) => {
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
  return { salesToday, cancelledCount, totalAgg, productAgg, paymentAgg, profitAgg, refundedSales, exchangeRefundIds };
};

const computeRefundAdjustments = (refundedSales: any[], exchangeRefundIds: any[]) => {
  const exchangeRefundIdSet = new Set(exchangeRefundIds.map((id: unknown) => String(id)));
  let refundedRevenue = 0;
  let refundedCost = 0;
  for (const sale of refundedSales) {
    const isExchangePaired = exchangeRefundIdSet.has(sale._id.toString());
    if (!isExchangePaired) refundedRevenue += sale.total;
    for (const item of sale.items) {
      refundedCost += item.quantity * item.costPrice;
    }
  }
  return { refundedRevenue, refundedCost };
};

const computePaymentBreakdown = (paymentAgg: PaymentMethodAggregation[]) => ({
  cashTotal: paymentAgg.find((p) => p._id === 'cash')?.total || 0,
  cardTotal: paymentAgg.find((p) => p._id === 'card')?.total || 0,
  transferTotal: paymentAgg.find((p) => p._id === 'transfer')?.total || 0,
  cashCount: paymentAgg.find((p) => p._id === 'cash')?.count || 0,
  cardCount: paymentAgg.find((p) => p._id === 'card')?.count || 0,
  transferCount: paymentAgg.find((p) => p._id === 'transfer')?.count || 0,
});

export const getSalesSummary = async (tenantId: string, filters?: SalesSummaryFilters) => {
  const match = buildSummaryMatch(tenantId, filters);
  const matchCompleted = { ...match, status: 'completed' };
  const matchRefunded = { ...match, status: 'refunded' };
  const matchCancelledOrRefunded = { ...match, status: { $in: ['cancelled', 'refunded'] } };

  const { salesToday, cancelledCount, totalAgg, productAgg, paymentAgg, profitAgg, refundedSales, exchangeRefundIds } =
    await runSalesAggregations(matchCompleted, matchRefunded, matchCancelledOrRefunded);

  const { refundedRevenue, refundedCost } = computeRefundAdjustments(refundedSales, exchangeRefundIds);

  const completedRevenue = totalAgg[0]?.totalRevenue || 0;
  const totalSalesCount = totalAgg[0]?.totalSales || 0;
  const totalProductsSold = productAgg[0]?.totalProducts || 0;
  const avgTicket = totalSalesCount > 0 ? Math.round(completedRevenue / totalSalesCount) : 0;
  const completedCost = profitAgg[0]?.totalCost || 0;

  const totalRevenue = completedRevenue - refundedRevenue;
  const totalCost = completedCost - refundedCost;
  const totalProfit = totalRevenue - totalCost;

  return {
    salesToday,
    totalRevenue,
    avgTicket,
    cancelledCount,
    totalProductsSold,
    totalProfit,
    totalCost,
    ...computePaymentBreakdown(paymentAgg as PaymentMethodAggregation[]),
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

async function enrichSaleWithUserName(saleObj: Record<string, any>): Promise<void> {
  try {
    const user = await User.findById(saleObj.userId).select('firstName lastName');
    saleObj.userName = user ? `${user.firstName} ${user.lastName}` : saleObj.userId.toString();
  } catch (error) {
    logger.error(`Failed to load user name for sale ${saleObj._id}: ${error instanceof Error ? error.message : String(error)}`);
    saleObj.userName = saleObj.userId.toString();
  }
}

export const getSaleById = async (saleId: string, tenantId: string, branchId?: string) => {
  const query: Record<string, any> = { _id: saleId, tenantId };
  if (branchId) query.branchId = branchId;
  const sale = await Sale.findOne(query);
  if (!sale) throw ApiError.notFound('Sale not found');

  const saleObj = sale.toObject() as Record<string, any>;
  await enrichSaleWithUserName(saleObj);

  return saleObj;
};

export const getSaleByNumber = async (saleNumber: string, tenantId: string, branchId?: string) => {
  const query: Record<string, any> = { saleNumber, tenantId, status: 'refunded' };
  if (branchId) query.branchId = branchId;
  const sale = await Sale.findOne(query);
  if (!sale) throw ApiError.notFound('Sale not found or not refunded');

  const saleObj = sale.toObject() as Record<string, any>;
  await enrichSaleWithUserName(saleObj);

  const usedAgg = await Sale.aggregate([
    { $match: { exchangeFromSaleId: sale._id, tenantId: new mongoose.Types.ObjectId(tenantId) } },
    { $group: { _id: null, total: { $sum: '$exchangeCredit' } } },
  ]).allowDiskUse(true);
  const usedCredit = usedAgg[0]?.total || 0;
  saleObj.availableExchangeCredit = sale.total - usedCredit;

  return saleObj;
};

export const getTransferSales = async (tenantId: string, branchId?: string, page: number = 1, limit: number = 20) => {
  const query: Record<string, any> = { tenantId, paymentMethod: 'transfer' };
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
    const query: Record<string, any> = { _id: saleId, tenantId };
    if (branchId) query.branchId = branchId;
    const sale = await Sale.findOne(query).session(session);
    if (!sale) throw ApiError.notFound('Sale not found');
    if (!saleStateMachine.canRefund(sale.status as 'completed' | 'cancelled' | 'refunded' | 'pending' | 'partial')) {
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
