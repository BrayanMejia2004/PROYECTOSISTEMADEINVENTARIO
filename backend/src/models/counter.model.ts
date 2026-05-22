import mongoose, { Schema, Document } from 'mongoose';

export interface ICounter extends Document {
  tenantId: string;
  key: string;
  sequence: number;
}

const CounterSchema = new Schema<ICounter>({
  tenantId: { type: String, required: true },
  key: { type: String, required: true },
  sequence: { type: Number, default: 0 },
});

CounterSchema.index({ tenantId: 1, key: 1 }, { unique: true });

export const Counter = mongoose.model<ICounter>('Counter', CounterSchema);
