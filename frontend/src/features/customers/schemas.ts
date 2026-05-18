import { z } from 'zod';

const phoneRegex = /^\+?\d{7,15}$/;
const taxIdRegex = /^[a-zA-Z0-9-]{6,20}$/;

export const customerSchema = z.object({
  name: z.string().min(2, 'Nombre mínimo 2 caracteres'),
  phone: z.string().regex(phoneRegex, 'Teléfono inválido').optional().or(z.literal('')),
  email: z.string().email('Email inválido').optional(),
  address: z.string().optional(),
  taxId: z.string().regex(taxIdRegex, 'RFC inválido').optional().or(z.literal('')),
});

export type CustomerForm = z.infer<typeof customerSchema>;
