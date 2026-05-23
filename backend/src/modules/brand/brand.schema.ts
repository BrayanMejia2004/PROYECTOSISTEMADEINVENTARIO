import { z } from 'zod';

export const createBrandSchema = z.object({
  name: z.string().min(1, 'Brand name is required'),
});

export const updateBrandSchema = z.object({
  name: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
});
