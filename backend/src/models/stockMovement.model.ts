import mongoose, { Schema, Document } from 'mongoose';

export type MovementType = 'sale' | 'return' | 'adjustment' | 'transfer';

export interface IStockMovement extends Document {
  tenantId: string;
  branchId: string;
  productId: string;
  type: MovementType;
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  note?: string;
  referenceId?: string;
  createdAt: Date;
}

const StockMovementSchema = new Schema<IStockMovement>(
  {
    tenantId: {
      type: String,
      required: true,
      index: true,
    },
    branchId: {
      type: String,
      required: true,
      index: true,
    },
    productId: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['sale', 'return', 'adjustment', 'transfer'],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    previousQuantity: {
      type: Number,
      required: true,
    },
    newQuantity: {
      type: Number,
      required: true,
    },
    note: {
      type: String,
      trim: true,
    },
    referenceId: {
      type: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

StockMovementSchema.index({ tenantId: 1, branchId: 1, productId: 1, createdAt: -1 });

export default mongoose.model<IStockMovement>('StockMovement', StockMovementSchema);
