import { z } from 'zod';

export const supplierSchema = z.object({
  name: z.string().min(2, 'Nombre mínimo 2 caracteres'),
  contactName: z.string().optional(),
  email: z.string().email('Email inválido').optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  taxId: z.string().optional(),
});

export type SupplierForm = z.infer<typeof supplierSchema>;
