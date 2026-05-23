import { z } from 'zod';

export const saleItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().min(1),
  unitPrice: z.number().min(0),
});

export const createSaleSchema = z.object({
  customerName: z.string().optional(),
  items: z.array(saleItemSchema).min(1, 'At least one item is required'),
  tax: z.number().min(0).optional(),
  discount: z.number().min(0).optional(),
  paymentMethod: z.enum(['cash', 'card', 'transfer', 'exchange']).optional(),
  transferReference: z.string().optional(),
  transferAmount: z.number().min(0).optional(),
  transferBank: z.string().optional(),
  cardBank: z.string().optional(),
  cardReference: z.string().optional(),
  exchangeFromSaleId: z.string().optional(),
  exchangeCredit: z.number().min(0).optional(),
});
