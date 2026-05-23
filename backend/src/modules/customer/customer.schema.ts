import { z } from 'zod';

export const createCustomerSchema = z.object({
  name: z.string().min(2, 'Nombre mínimo 2 caracteres'),
  phone: z.string().optional(),
  email: z.string().email('Email inválido').optional(),
  address: z.string().optional(),
  taxId: z.string().optional(),
});

export const updateCustomerSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  taxId: z.string().optional(),
  isActive: z.boolean().optional(),
});
