import mongoose from 'mongoose';

const brandSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
  name: { type: String, required: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

brandSchema.index({ tenantId: 1, branchId: 1, name: 1 }, { unique: true });

export default mongoose.model('Brand', brandSchema);
