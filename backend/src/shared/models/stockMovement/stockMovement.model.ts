import mongoose from 'mongoose';

export type MovementType = 'sale' | 'return' | 'adjustment' | 'transfer';

const stockMovementSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  type: { type: String, enum: ['sale', 'return', 'adjustment', 'transfer'], required: true },
  quantity: { type: Number, required: true },
  previousQuantity: { type: Number, required: true },
  newQuantity: { type: Number, required: true },
  referenceId: { type: String },
  note: { type: String },
}, { timestamps: true });

stockMovementSchema.index({ tenantId: 1, branchId: 1, createdAt: -1 });
stockMovementSchema.index({ tenantId: 1, productId: 1, createdAt: -1 });
stockMovementSchema.index({ tenantId: 1, branchId: 1, type: 1, createdAt: -1 });

export default mongoose.model('StockMovement', stockMovementSchema);
