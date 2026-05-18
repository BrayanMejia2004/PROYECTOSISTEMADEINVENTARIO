import { z } from 'zod';

export const departmentSchema = z.object({
  name: z.string().min(2, 'Nombre mínimo 2 caracteres'),
});

export type DepartmentForm = z.infer<typeof departmentSchema>;
