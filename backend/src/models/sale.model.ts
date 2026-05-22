import mongoose, { Schema, Document } from 'mongoose';

export interface ISaleItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  costPrice: number;
  total: number;
}

export interface ISale extends Document {
  tenantId: string;
  saleNumber: string;
  branchId: string;
  userId: string;
  customerId?: string;
  customerName?: string;
  items: ISaleItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'transfer' | 'exchange';
  status: 'completed' | 'cancelled' | 'refunded' | 'pending' | 'partial';
  transferReference?: string;
  transferAmount?: number;
  transferBank?: string;
  cardBank?: string;
  cardReference?: string;
  exchangeFromSaleId?: string;
  exchangeCredit?: number;
  createdAt: Date;
  updatedAt: Date;
}

const SaleItemSchema = new Schema<ISaleItem>(
  {
    productId: { type: String, required: true, index: true },
    productName: { type: String, required: true },
    sku: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    costPrice: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const SaleSchema = new Schema<ISale>(
  {
    tenantId: { type: String, required: true, index: true },
    saleNumber: { type: String, required: true },
    branchId: { type: String, required: true, index: true },
    userId: { type: String, required: true },
    customerId: { type: String, index: true },
    customerName: { type: String, trim: true },
    items: { type: [SaleItemSchema], required: true },
    subtotal: { type: Number, required: true, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'transfer', 'exchange'],
      required: true,
    },
    status: {
      type: String,
      enum: ['completed', 'cancelled', 'refunded', 'pending', 'partial'],
      default: 'completed',
    },
    transferReference: { type: String, trim: true },
    transferAmount: { type: Number, min: 0 },
    transferBank: { type: String, trim: true },
    cardBank: { type: String, trim: true },
    cardReference: { type: String, trim: true },
    exchangeFromSaleId: { type: String, index: true },
    exchangeCredit: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

SaleSchema.index({ tenantId: 1, saleNumber: 1 }, { unique: true });
SaleSchema.index({ tenantId: 1, branchId: 1, createdAt: -1 });
SaleSchema.index({ tenantId: 1, createdAt: -1, status: 1 });

export const Sale = mongoose.model<ISale>('Sale', SaleSchema);
export const SaleItem = mongoose.model<ISaleItem>('SaleItem', SaleItemSchema);
