import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  address: { type: String },
  taxId: { type: String },
  isActive: { type: Boolean, default: true },
  totalPurchases: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  lastPurchaseDate: { type: Date },
}, { timestamps: true });

customerSchema.index({ tenantId: 1, branchId: 1 });

export default mongoose.model('Customer', customerSchema);
