import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
  name: { type: String, required: true },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

departmentSchema.index({ tenantId: 1, branchId: 1, name: 1 }, { unique: true });

export default mongoose.model('Department', departmentSchema);
