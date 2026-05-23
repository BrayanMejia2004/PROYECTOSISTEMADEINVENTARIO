import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  role: { type: String, enum: ['owner', 'admin', 'cashier'], default: 'cashier' },
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

userSchema.index({ tenantId: 1, email: 1 }, { unique: true });
userSchema.index({ tenantId: 1, branchId: 1 });

export default mongoose.model('User', userSchema);
