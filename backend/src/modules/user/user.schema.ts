import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número'),
  firstName: z.string().min(2).max(100),
  lastName: z.string().min(2).max(100),
  role: z.enum(['cashier', 'admin', 'owner']),
  branchId: z.string().optional(),
});

export const updateUserSchema = z.object({
  email: z.string().email().optional(),
  password: z.string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número')
    .optional(),
  firstName: z.string().min(2).max(100).optional(),
  lastName: z.string().min(2).max(100).optional(),
  role: z.enum(['cashier', 'admin', 'owner']).optional(),
  branchId: z.string().optional(),
  isActive: z.boolean().optional(),
});
