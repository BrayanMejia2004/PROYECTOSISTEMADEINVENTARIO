import { z } from 'zod';

export const createCustomerSchema = z.object({
  name: z.string().min(2, 'Nombre mínimo 2 caracteres').max(200),
  phone: z.string().max(30).optional(),
  email: z.string().email('Email inválido').max(200).optional(),
  address: z.string().max(500).optional(),
  taxId: z.string().max(50).optional(),
});

export const updateCustomerSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  phone: z.string().max(30).optional(),
  email: z.string().email().max(200).optional(),
  address: z.string().max(500).optional(),
  taxId: z.string().max(50).optional(),
  isActive: z.boolean().optional(),
});
