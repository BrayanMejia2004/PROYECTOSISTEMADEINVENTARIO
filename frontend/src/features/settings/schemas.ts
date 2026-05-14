import { z } from 'zod';

export const tenantSettingsSchema = z.object({
  name: z.string().min(2, 'Nombre mínimo 2 caracteres').optional(),
  email: z.string().email('Email inválido').optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  nit: z.string().optional(),
});

export const branchSchema = z.object({
  name: z.string().min(2, 'Nombre mínimo 2 caracteres'),
  address: z.string().optional(),
  phone: z.string().optional(),
});

export type TenantSettingsForm = z.infer<typeof tenantSettingsSchema>;
export type BranchForm = z.infer<typeof branchSchema>;
