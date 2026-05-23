import mongoose from 'mongoose';

const supplierSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  name: { type: String, required: true },
  contactName: { type: String },
  email: { type: String },
  phone: { type: String },
  address: { type: String },
  taxId: { type: String },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

supplierSchema.index({ tenantId: 1, name: 1 }, { unique: true });

export default mongoose.model('Supplier', supplierSchema);
