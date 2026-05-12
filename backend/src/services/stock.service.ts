import mongoose from 'mongoose';
import Stock from '../models/stock.model';
import StockMovement from '../models/stockMovement.model';
import Product from '../models/product.model';
import { ApiError } from '../utils/ApiError';
import { MovementType } from '../models/stockMovement.model';

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

export const getStockByBranch = async (tenantId: string, branchId: string) => {
  const stock = await Stock.find({ tenantId, branchId })
    .populate('productId', 'name sku barcode')
    .sort({ createdAt: -1 });
  return stock;
};

export const getLowStockAlerts = async (tenantId: string, branchId?: string) => {
  const match: any = { tenantId };
  if (branchId) match.branchId = branchId;

  const stock = await Stock.aggregate([
    { $match: match },
    { $addFields: { productIdObj: { $toObjectId: '$productId' } } },
    {
      $lookup: {
        from: 'products',
        localField: 'productIdObj',
        foreignField: '_id',
        as: 'product',
      },
    },
    { $unwind: '$product' },
    {
      $match: {
        $expr: { $lte: ['$quantity', '$product.minStock'] },
      },
    },
    {
      $project: {
        productId: 1,
        branchId: 1,
        quantity: 1,
        price: 1,
        productName: '$product.name',
        sku: '$product.sku',
        minStock: '$product.minStock',
      },
    },
  ]);

  return stock;
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
  if (!product || product.tenantId !== tenantId) {
    throw ApiError.notFound('Product not found');
  }

  const stock = new Stock({
    tenantId,
    branchId,
    productId,
    quantity,
    price,
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
