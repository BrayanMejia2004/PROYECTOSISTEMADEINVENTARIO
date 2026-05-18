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
  transferReference: z.string().optional(),
  transferBank: z.string().optional(),
  transferAmount: z.number().min(0).optional(),
  cardBank: z.string().optional(),
  cardReference: z.string().optional(),
});

export const cashMovementSchema = z.object({
  type: z.enum(['entry', 'exit']),
  amount: z.number().min(1, 'El monto debe ser mayor a 0'),
  reason: z.string().min(1, 'El motivo es requerido'),
});

export const openShiftSchema = z.object({
  openingAmount: z.number().min(0, 'El monto debe ser positivo'),
});

export type SaleForm = z.infer<typeof saleSchema>;
export type SaleItemForm = z.infer<typeof saleItemSchema>;
export type CashMovementForm = z.infer<typeof cashMovementSchema>;
export type OpenShiftForm = z.infer<typeof openShiftSchema>;
