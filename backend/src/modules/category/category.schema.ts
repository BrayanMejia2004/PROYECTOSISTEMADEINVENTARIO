import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(2),
  parentId: z.string().optional(),
});

export const updateCategorySchema = z.object({
  name: z.string().min(2).optional(),
  parentId: z.string().optional(),
  isActive: z.boolean().optional(),
});
