import { z } from 'zod';

export const saleItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().min(1),
  unitPrice: z.number().min(0),
});

export const saleSchema = z.object({
  customerName: z.string().optional(),
  items: z.array(saleItemSchema).min(1, 'Al menos un producto'),
  tax: z.number().min(0).default(0),
  discount: z.number().min(0).default(0),
  paymentMethod: z.enum(['cash', 'card', 'transfer']),
});

export type SaleForm = z.infer<typeof saleSchema>;
export type SaleItemForm = z.infer<typeof saleItemSchema>;
