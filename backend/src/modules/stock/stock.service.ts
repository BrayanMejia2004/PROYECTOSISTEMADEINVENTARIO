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
  skipMovement?: boolean;
}

interface StockMovementData {
  tenantId: string;
  branchId: string;
  productId: string;
  type: MovementType;
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  note?: string;
  referenceId?: string;
}

interface StockMovedEventData {
  tenantId: string;
  branchId: string;
  productId: string;
  type: MovementType;
  quantity: number;
  newQuantity: number;
}

type StockOp = { incMultiplier: -1 | 1; checkStock: boolean };

const STOCK_OPERATIONS: Record<MovementType, StockOp> = {
  sale: { incMultiplier: -1, checkStock: true },
  return: { incMultiplier: 1, checkStock: false },
  adjustment: { incMultiplier: -1, checkStock: true },
  transfer: { incMultiplier: -1, checkStock: true },
};

const computeIsLowStock = (newQuantity: number, minStock: number): boolean =>
  newQuantity <= minStock;

const createStockMovement = async (data: StockMovementData, session?: mongoose.ClientSession): Promise<void> => {
  const movement = new StockMovement(data);
  await movement.save({ session });
};

const emitStockMovedEvent = async (data: StockMovedEventData): Promise<void> => {
  eventBus.emit(Events.STOCK_MOVED, data);
};

export const moveStock = async (input: MoveStockInput): Promise<void> => {
  const { tenantId, branchId, productId, type, quantity, note, referenceId, session, skipMovement } = input;

  const op = STOCK_OPERATIONS[type];
  if (!op) throw ApiError.badRequest(`Tipo de movimiento inválido: ${type}`);

  const filter: Record<string, any> = { tenantId, branchId, productId };
  if (op.checkStock && quantity > 0) {
    filter.quantity = { $gte: quantity };
  }

  const stock = await Stock.findOneAndUpdate(
    filter,
    { $inc: { quantity: op.incMultiplier * quantity } },
    { new: true, session: session || null }
  );

  if (!stock) {
    if (type === 'return') throw ApiError.notFound('Registro de stock no encontrado');
    throw ApiError.badRequest('Stock insuficiente');
  }

  const previousQuantity = stock.quantity - (op.incMultiplier * quantity);
  stock.isLowStock = computeIsLowStock(stock.quantity, stock.minStock);
  await stock.save({ session });

  if (!skipMovement) {
    await createStockMovement({
      tenantId, branchId, productId, type, quantity,
      previousQuantity, newQuantity: stock.quantity,
      note, referenceId,
    }, session);
  }

  await emitStockMovedEvent({
    tenantId, branchId, productId, type, quantity,
    newQuantity: stock.quantity,
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
  return queryPopulatedStock(query, 'name sku barcode minStock', { quantity: 1 }, page, limit, mapOutOfStockItem);
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
    minStock: product.minStock || 0,
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
  const stock = await Stock.findOneAndUpdate(
    { tenantId, branchId, productId },
    { $set: { price } },
    { new: true }
  );
  if (!stock) {
    throw ApiError.notFound('Registro de stock no encontrado');
  }
  return stock;
};

export const adjustStock = async (
  tenantId: string,
  branchId: string,
  productId: string,
  quantity: number,
  note: string
) => {
  await moveStock({ tenantId, branchId, productId, type: 'adjustment', quantity, note });
};
