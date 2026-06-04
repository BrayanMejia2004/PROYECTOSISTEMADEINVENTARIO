import { z } from 'zod';

export const createSupplierSchema = z.object({
  name: z.string().min(2).max(200),
  contactName: z.string().max(200).optional(),
  email: z.string().email().max(200).optional(),
  phone: z.string().max(30).optional(),
  address: z.string().max(500).optional(),
  taxId: z.string().max(50).optional(),
});

export const updateSupplierSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  contactName: z.string().max(200).optional(),
  email: z.string().email().max(200).optional(),
  phone: z.string().max(30).optional(),
  address: z.string().max(500).optional(),
  taxId: z.string().max(50).optional(),
  isActive: z.boolean().optional(),
});
