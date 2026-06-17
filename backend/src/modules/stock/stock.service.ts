import mongoose from 'mongoose';
import Stock from '../../shared/models/stock/stock.model';
import StockMovement from '../../shared/models/stockMovement/stockMovement.model';
import Product from '../../shared/models/product/product.model';
import { ApiError } from '../../shared/utils/apiError/ApiError';
import { MovementType } from '../../shared/models/stockMovement/stockMovement.model';
import { eventBus, Events } from '../../shared/utils/eventBus';
import type { PopulatedProductInfo, PopulatedBranchInfo, StockFilter } from '../../shared/types/queries';

interface MoveStockInput {
  tenantId: string;
  branchId: string;
  productId: string;
  type: MovementType;
  quantity: number;
  note?: string;
  referenceId?: string;
  session?: mongoose.ClientSession;
}

export const moveStock = async (input: MoveStockInput): Promise<void> => {
  const { tenantId, branchId, productId, type, quantity, note, referenceId, session } = input;

  const stock = await Stock.findOne({ tenantId, branchId, productId }).session(session || null);
  if (!stock) {
    throw ApiError.notFound('Stock record not found for this product in the branch');
  }

  const previousQuantity = stock.quantity;
  let newQuantity: number;

  if (type === 'sale') {
    newQuantity = previousQuantity - quantity;
    if (newQuantity < 0) {
      throw ApiError.badRequest('Insufficient stock');
    }
  } else if (type === 'return') {
    newQuantity = previousQuantity + quantity;
  } else {
    newQuantity = previousQuantity - quantity;
    if (newQuantity < 0) {
      throw ApiError.badRequest('Insufficient stock');
    }
  }

  stock.quantity = newQuantity;

  const prod = await Product.findById(productId).select('minStock').lean();
  stock.isLowStock = prod ? stock.quantity <= (prod.minStock || 0) : false;

  await stock.save({ session });

  const movement = new StockMovement({
    tenantId,
    branchId,
    productId,
    type,
    quantity,
    previousQuantity,
    newQuantity,
    note,
    referenceId,
  });
  await movement.save({ session });

  eventBus.emit(Events.STOCK_MOVED, {
    tenantId,
    branchId,
    productId,
    type,
    quantity,
    newQuantity,
  });
};

export const getStockByBranch = async (
  tenantId: string,
  branchId: string,
  page: number = 1,
  limit: number = 50
) => {
  const [total, stock] = await Promise.all([
    Stock.countDocuments({ tenantId, branchId }),
    Stock.find({ tenantId, branchId })
      .populate('productId', 'name sku barcode')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
  ]);

  return { data: stock, meta: { total, page, limit } };
};

const mapPopulatedStock = (s: any) => {
  const product = s.productId as unknown as PopulatedProductInfo;
  return {
    productId: product._id?.toString() || s.productId,
    branchId: s.branchId,
    quantity: s.quantity,
    price: s.price,
    productName: product.name || 'Unknown',
    sku: product.sku || '',
    minStock: product.minStock || 0,
  };
};

const mapOutOfStockItem = (s: any) => {
  const product = s.productId as unknown as PopulatedProductInfo;
  const branch = s.branchId as unknown as PopulatedBranchInfo;
  return {
    _id: s._id,
    productId: product._id?.toString() || s.productId,
    branchId: branch._id?.toString() || s.branchId,
    quantity: s.quantity,
    price: s.price,
    productName: product.name || 'Unknown',
    sku: product.sku || '',
    barcode: product.barcode || '',
    minStock: product.minStock || 0,
    branchName: branch.name || 'Unknown',
  };
};

const queryPopulatedStock = async <T>(query: StockFilter, populateFields: string, sort: any, page: number, limit: number, mapper: (s: any) => T) => {
  const [total, stock] = await Promise.all([
    Stock.countDocuments(query),
    Stock.find(query)
      .populate('productId', populateFields)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
  ]);
  return { data: stock.map(mapper), meta: { total, page, limit } };
};

export const getLowStockAlerts = async (tenantId: string, branchId?: string, page: number = 1, limit: number = 50) => {
  const query: StockFilter = { tenantId, isLowStock: true };
  if (branchId) query.branchId = branchId;
  return queryPopulatedStock(query, 'name sku minStock', { quantity: 1 }, page, limit, mapPopulatedStock);
};

export const getOutOfStock = async (tenantId: string, branchId?: string, page: number = 1, limit: number = 100) => {
  const query: StockFilter = { tenantId, quantity: 0 };
  if (branchId) query.branchId = branchId;
  return queryPopulatedStock(query, 'name sku barcode minStock', { 'productId.name': 1 }, page, limit, mapOutOfStockItem);
};

export const initializeStock = async (
  tenantId: string,
  branchId: string,
  productId: string,
  price: number,
  quantity: number = 0
) => {
  const existing = await Stock.findOne({ tenantId, branchId, productId });
  if (existing) {
    throw ApiError.conflict('Stock already initialized for this product in this branch');
  }

  const product = await Product.findById(productId);
  if (!product || product.tenantId.toString() !== tenantId) {
    throw ApiError.notFound('Product not found');
  }

  const stock = new Stock({
    tenantId,
    branchId,
    productId,
    quantity,
    price,
    isLowStock: quantity <= (product.minStock || 0),
  });
  await stock.save();

  if (quantity > 0) {
    const movement = new StockMovement({
      tenantId,
      branchId,
      productId,
      type: 'adjustment' as MovementType,
      quantity,
      previousQuantity: 0,
      newQuantity: quantity,
      note: 'Initial stock',
    });
    await movement.save();
  }

  return stock;
};

export const updateStockPrice = async (
  tenantId: string,
  branchId: string,
  productId: string,
  price: number
) => {
  const stock = await Stock.findOne({ tenantId, branchId, productId });
  if (!stock) {
    throw ApiError.notFound('Stock record not found');
  }

  stock.price = price;
  await stock.save();
  return stock;
};

export const adjustStock = async (
  tenantId: string,
  branchId: string,
  productId: string,
  quantity: number,
  note: string
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await moveStock({
      tenantId,
      branchId,
      productId,
      type: 'adjustment',
      quantity,
      note,
      session,
    });
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};
