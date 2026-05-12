import { z } from 'zod';

export const customerSchema = z.object({
  name: z.string().min(2, 'Nombre mínimo 2 caracteres'),
  phone: z.string().optional(),
  email: z.string().email('Email inválido').optional(),
  address: z.string().optional(),
  taxId: z.string().optional(),
});

export type CustomerForm = z.infer<typeof customerSchema>;
