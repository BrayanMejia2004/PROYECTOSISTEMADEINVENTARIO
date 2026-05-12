import mongoose, { Schema, Document } from 'mongoose';

export interface ICashMovement extends Document {
  tenantId: string;
  branchId: string;
  shiftId: string;
  userId: string;
  type: 'entry' | 'exit';
  amount: number;
  reason: string;
  createdAt: Date;
}

const CashMovementSchema = new Schema<ICashMovement>(
  {
    tenantId: { type: String, required: true, index: true },
    branchId: { type: String, required: true, index: true },
    shiftId: { type: String, required: true, index: true },
    userId: { type: String, required: true },
    type: { type: String, enum: ['entry', 'exit'], required: true },
    amount: { type: Number, required: true, min: 1 },
    reason: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model<ICashMovement>('CashMovement', CashMovementSchema);
