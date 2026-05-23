import mongoose from 'mongoose';

const saleItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  sku: { type: String },
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  costPrice: { type: Number, default: 0 },
  total: { type: Number, required: true },
}, { _id: false });

const saleSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  saleNumber: { type: String, required: true },
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  customerName: { type: String },
  items: [saleItemSchema],
  subtotal: { type: Number, required: true },
  tax: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['cash', 'card', 'transfer', 'exchange'], required: true },
  status: { type: String, enum: ['completed', 'cancelled', 'refunded', 'pending', 'partial'], default: 'completed' },
  transferReference: { type: String },
  transferAmount: { type: Number },
  transferBank: { type: String },
  cardBank: { type: String },
  cardReference: { type: String },
  exchangeFromSaleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Sale' },
  exchangeCredit: { type: Number },
  availableExchangeCredit: { type: Number },
}, { timestamps: true });

saleSchema.index({ tenantId: 1, saleNumber: 1 }, { unique: true });
saleSchema.index({ tenantId: 1, branchId: 1, createdAt: -1 });
saleSchema.index({ tenantId: 1, createdAt: 1, status: 1 });
saleSchema.index({ tenantId: 1, customerId: 1 });

export const Sale = mongoose.model('Sale', saleSchema);
export const SaleItem = saleItemSchema;
