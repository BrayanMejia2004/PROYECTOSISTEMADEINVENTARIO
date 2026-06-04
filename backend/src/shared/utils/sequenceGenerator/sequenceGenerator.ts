import mongoose from 'mongoose';
import { Counter } from '../../models/counter/counter.model';

export const generateSaleNumber = async (tenantId: string): Promise<string> => {
  const counter = await Counter.findOneAndUpdate(
    { tenantId: new mongoose.Types.ObjectId(tenantId), key: 'saleNumber' },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  const year = new Date().getFullYear();
  return `V-${year}-${String(counter.seq).padStart(6, '0')}`;
};
