import { z } from 'zod';

export const createDepartmentSchema = z.object({
  name: z.string().min(2).max(100),
  parentId: z.string().optional(),
});

export const updateDepartmentSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  parentId: z.string().optional(),
  isActive: z.boolean().optional(),
});
