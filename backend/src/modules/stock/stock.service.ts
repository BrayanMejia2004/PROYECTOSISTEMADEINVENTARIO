import mongoose from 'mongoose';
import Stock from '../../shared/models/stock/stock.model';
import StockMovement from '../../shared/models/stockMovement/stockMovement.model';
import Product from '../../shared/models/product/product.model';
import { ApiError } from '../../shared/utils/apiError/ApiError';
import { MovementType } from '../../shared/models/stockMovement/stockMovement.model';

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

export const getLowStockAlerts = async (
  tenantId: string,
  branchId?: string,
  page: number = 1,
  limit: number = 50
) => {
  const query: any = { tenantId, isLowStock: true, quantity: { $gt: 0 } };
  if (branchId) query.branchId = branchId;

  const [total, stock] = await Promise.all([
    Stock.countDocuments(query),
    Stock.find(query)
      .populate('productId', 'name sku minStock')
      .populate('branchId', 'name')
      .sort({ quantity: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
  ]);

  const data = stock.map(s => ({
    productId: (s.productId as any)?._id?.toString() || s.productId,
    branchId: (s.branchId as any)?._id?.toString() || s.branchId,
    quantity: s.quantity,
    price: s.price,
    productName: (s.productId as any)?.name || 'Unknown',
    sku: (s.productId as any)?.sku || '',
    minStock: (s.productId as any)?.minStock || 0,
    branchName: (s.branchId as any)?.name || 'Unknown',
  }));

  return { data, meta: { total, page, limit } };
};

export const getOutOfStock = async (
  tenantId: string,
  branchId?: string,
  page: number = 1,
  limit: number = 100
) => {
  const query: any = { tenantId, quantity: 0 };
  if (branchId) query.branchId = branchId;

  const [total, stock] = await Promise.all([
    Stock.countDocuments(query),
    Stock.find(query)
      .populate('productId', 'name sku barcode minStock')
      .populate('branchId', 'name')
      .sort({ 'productId.name': 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
  ]);

  const data = stock.map(s => ({
    _id: (s as any)._id,
    productId: (s.productId as any)?._id?.toString() || s.productId,
    branchId: (s.branchId as any)?._id?.toString() || s.branchId,
    quantity: s.quantity,
    price: s.price,
    productName: (s.productId as any)?.name || 'Unknown',
    sku: (s.productId as any)?.sku || '',
    barcode: (s.productId as any)?.barcode || '',
    minStock: (s.productId as any)?.minStock || 0,
    branchName: (s.branchId as any)?.name || 'Unknown',
  }));

  return { data, meta: { total, page, limit } };
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
