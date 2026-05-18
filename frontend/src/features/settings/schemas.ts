import { z } from 'zod';

const phoneRegex = /^\+?\d{7,15}$/;
const taxIdRegex = /^[a-zA-Z0-9-]{6,20}$/;

export const tenantSettingsSchema = z.object({
  name: z.string().min(2, 'Nombre mínimo 2 caracteres').optional(),
  email: z.string().email('Email inválido').optional(),
  phone: z.string().regex(phoneRegex, 'Teléfono inválido').optional().or(z.literal('')),
  address: z.string().optional(),
  nit: z.string().regex(taxIdRegex, 'NIT inválido').optional().or(z.literal('')),
});

export const branchSchema = z.object({
  name: z.string().min(2, 'Nombre mínimo 2 caracteres'),
  address: z.string().optional(),
  phone: z.string().regex(phoneRegex, 'Teléfono inválido').optional().or(z.literal('')),
});

export type TenantSettingsForm = z.infer<typeof tenantSettingsSchema>;
export type BranchForm = z.infer<typeof branchSchema>;
