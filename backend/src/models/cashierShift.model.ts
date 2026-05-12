import mongoose, { Schema, Document } from 'mongoose';

export interface ICashierShift extends Document {
  tenantId: string;
  branchId: string;
  userId: string;
  openingBalance: number;
  closingBalance?: number;
  totalSales: number;
  totalCash: number;
  totalCard: number;
  totalTransfer: number;
  totalProfit: number;
  totalEntries: number;
  totalExits: number;
  status: 'open' | 'closed';
  openedAt: Date;
  closedAt?: Date;
}

const CashierShiftSchema = new Schema<ICashierShift>(
  {
    tenantId: { type: String, required: true, index: true },
    branchId: { type: String, required: true, index: true },
    userId: { type: String, required: true },
    openingBalance: { type: Number, required: true, min: 0 },
    closingBalance: { type: Number, min: 0 },
    totalSales: { type: Number, default: 0, min: 0 },
    totalCash: { type: Number, default: 0, min: 0 },
    totalCard: { type: Number, default: 0, min: 0 },
    totalTransfer: { type: Number, default: 0, min: 0 },
    totalProfit: { type: Number, default: 0 },
    totalEntries: { type: Number, default: 0, min: 0 },
    totalExits: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: ['open', 'closed'], default: 'open' },
    openedAt: { type: Date, default: Date.now },
    closedAt: { type: Date },
  },
  { timestamps: true }
);

CashierShiftSchema.index({ tenantId: 1, branchId: 1, status: 1 });
CashierShiftSchema.index({ tenantId: 1, branchId: 1, openedAt: -1 });

export default mongoose.model<ICashierShift>('CashierShift', CashierShiftSchema);
