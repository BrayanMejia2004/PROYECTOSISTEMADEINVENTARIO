import mongoose from 'mongoose';

const cashierShiftSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  openingBalance: { type: Number, required: true },
  closingBalance: { type: Number },
  totalSales: { type: Number, default: 0 },
  totalCash: { type: Number, default: 0 },
  totalCard: { type: Number, default: 0 },
  totalTransfer: { type: Number, default: 0 },
  totalProfit: { type: Number, default: 0 },
  totalEntries: { type: Number, default: 0 },
  totalExits: { type: Number, default: 0 },
  status: { type: String, enum: ['open', 'closed'], default: 'open' },
  openedAt: { type: Date, default: Date.now },
  closedAt: { type: Date },
}, { timestamps: true });

cashierShiftSchema.index({ tenantId: 1, branchId: 1, status: 1 });
cashierShiftSchema.index({ tenantId: 1, userId: 1, status: 1 });

export default mongoose.model('CashierShift', cashierShiftSchema);
