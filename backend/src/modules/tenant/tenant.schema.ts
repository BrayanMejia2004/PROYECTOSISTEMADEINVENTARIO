import { z } from 'zod';

export const updateSettingsSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  email: z.string().email().max(200).optional(),
  phone: z.string().max(30).optional(),
  address: z.string().max(500).optional(),
  nit: z.string().max(50).optional(),
});
