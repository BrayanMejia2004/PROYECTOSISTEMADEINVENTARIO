import { z } from 'zod';

const phoneRegex = /^\+?\d{7,15}$/;
const taxIdRegex = /^[a-zA-Z0-9-]{6,20}$/;

export const supplierSchema = z.object({
  name: z.string().min(2, 'Nombre mínimo 2 caracteres'),
  contactName: z.string().optional(),
  email: z.string().email('Email inválido').optional(),
  phone: z.string().regex(phoneRegex, 'Teléfono inválido').optional().or(z.literal('')),
  address: z.string().optional(),
  taxId: z.string().regex(taxIdRegex, 'RFC inválido').optional().or(z.literal('')),
});

export type SupplierForm = z.infer<typeof supplierSchema>;
