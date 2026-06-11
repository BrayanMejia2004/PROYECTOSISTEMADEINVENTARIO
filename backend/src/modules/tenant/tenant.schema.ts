import { z } from 'zod';

const hexColor = z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color hex inválido').optional();

export const updateSettingsSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  email: z.string().email().max(200).optional(),
  phone: z.string().max(30).optional(),
  address: z.string().max(500).optional(),
  nit: z.string().max(50).optional(),
  brandColor: hexColor,
  brandColorLight: hexColor,
  brandColorDark: hexColor,
  brandSidebar: hexColor,
});
