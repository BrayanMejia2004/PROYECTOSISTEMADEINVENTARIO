import mongoose from 'mongoose';

const stockSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, default: 0 },
  price: { type: Number, required: true },
  minStock: { type: Number, default: 0 },
  isLowStock: { type: Boolean, default: false },
}, { timestamps: true });

stockSchema.index({ tenantId: 1, branchId: 1, productId: 1 }, { unique: true });
stockSchema.index({ tenantId: 1, branchId: 1, isLowStock: 1 });
stockSchema.index({ tenantId: 1, branchId: 1, quantity: 1 });

export default mongoose.model('Stock', stockSchema);
