import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  name: { type: String, required: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

categorySchema.index({ tenantId: 1, name: 1 }, { unique: true });

export default mongoose.model('Category', categorySchema);
