import { z } from 'zod';

export const userSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres').optional(),
  firstName: z.string().min(2, 'Mínimo 2 caracteres'),
  lastName: z.string().min(2, 'Mínimo 2 caracteres'),
  role: z.enum(['cashier', 'admin', 'owner']),
  branchId: z.string().optional(),
});

export type UserForm = z.infer<typeof userSchema>;
