import { z } from 'zod';

export const cashMovementSchema = z.object({
  type: z.enum(['entry', 'exit']),
  amount: z.number().min(1, 'El monto debe ser mayor a 0'),
  reason: z.string().min(1, 'El motivo es requerido'),
});

export const openShiftSchema = z.object({
  openingAmount: z.number().min(0, 'El monto debe ser positivo'),
});

export type CashMovementForm = z.infer<typeof cashMovementSchema>;
export type OpenShiftForm = z.infer<typeof openShiftSchema>;
