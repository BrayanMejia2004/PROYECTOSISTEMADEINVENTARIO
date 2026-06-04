import mongoose from 'mongoose';

const cashMovementSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  shiftId: { type: mongoose.Schema.Types.ObjectId, ref: 'CashierShift', required: true },
  type: { type: String, enum: ['entry', 'exit'], required: true },
  amount: { type: Number, required: true },
  reason: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

cashMovementSchema.index({ shiftId: 1, createdAt: -1 });
cashMovementSchema.index({ tenantId: 1, branchId: 1, shiftId: 1 });

export default mongoose.model('CashMovement', cashMovementSchema);
