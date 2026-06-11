import { z } from 'zod';

const phoneRegex = /^\+?\d{7,15}$/;
const taxIdRegex = /^[a-zA-Z0-9-]{6,20}$/;
const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;

export const tenantSettingsSchema = z.object({
  name: z.string().min(2, 'Nombre mínimo 2 caracteres').optional(),
  email: z.string().email('Email inválido').optional(),
  phone: z.string().regex(phoneRegex, 'Teléfono inválido').optional().or(z.literal('')),
  address: z.string().optional(),
  nit: z.string().regex(taxIdRegex, 'NIT inválido').optional().or(z.literal('')),
});

export const brandingSchema = z.object({
  brandColor: z.string().regex(hexColorRegex, 'Color hex inválido (ej: #2D8A4E)').optional(),
  brandColorLight: z.string().regex(hexColorRegex, 'Color hex inválido').optional(),
  brandColorDark: z.string().regex(hexColorRegex, 'Color hex inválido').optional(),
  brandSidebar: z.string().regex(hexColorRegex, 'Color hex inválido').optional(),
});

export const branchSchema = z.object({
  name: z.string().min(2, 'Nombre mínimo 2 caracteres'),
  address: z.string().optional(),
  phone: z.string().regex(phoneRegex, 'Teléfono inválido').optional().or(z.literal('')),
});

export type TenantSettingsForm = z.infer<typeof tenantSettingsSchema>;
export type BrandingForm = z.infer<typeof brandingSchema>;
export type BranchForm = z.infer<typeof branchSchema>;
