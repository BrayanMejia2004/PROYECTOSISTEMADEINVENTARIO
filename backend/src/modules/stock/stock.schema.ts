import { z } from 'zod';

export const initializeStockSchema = z.object({
  productId: z.string().min(1),
  price: z.number().min(0),
  quantity: z.number().min(0).default(0),
  branchId: z.string().optional(),
});

export const updatePriceSchema = z.object({
  price: z.number().min(0),
});

export const adjustStockSchema = z.object({
  quantity: z.number().min(0),
  note: z.string().min(1),
});
