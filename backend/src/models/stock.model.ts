import mongoose, { Schema, Document } from 'mongoose';

export interface IStock extends Document {
  tenantId: string;
  branchId: string;
  productId: string;
  quantity: number;
  price: number;
  isLowStock: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const StockSchema = new Schema<IStock>(
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
    quantity: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    isLowStock: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

StockSchema.index({ tenantId: 1, branchId: 1, productId: 1 }, { unique: true });
StockSchema.index({ tenantId: 1, branchId: 1, isLowStock: 1 });

export default mongoose.model<IStock>('Stock', StockSchema);
