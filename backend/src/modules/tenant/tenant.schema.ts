import { z } from 'zod';

export const updateSettingsSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  nit: z.string().optional(),
});
