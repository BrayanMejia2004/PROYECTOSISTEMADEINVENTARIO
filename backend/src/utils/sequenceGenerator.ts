import { Counter } from '../models/counter.model';

export const generateSaleNumber = async (tenantId: string): Promise<string> => {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateKey = `sale-${year}${month}${day}`;

  const counter = await Counter.findOneAndUpdate(
    { tenantId, key: dateKey },
    { $inc: { sequence: 1 } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return `S-${year}${month}${day}-${String(counter.sequence).padStart(4, '0')}`;
};

export const generateOrderNumber = async (tenantId: string): Promise<string> => {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const dateKey = `po-${year}${month}`;

  const counter = await Counter.findOneAndUpdate(
    { tenantId, key: dateKey },
    { $inc: { sequence: 1 } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return `PO-${year}${month}-${String(counter.sequence).padStart(4, '0')}`;
};
