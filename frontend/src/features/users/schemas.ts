import { z } from 'zod';

export const userSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número')
    .optional(),
  confirmPassword: z.string().optional(),
  firstName: z.string().min(2, 'Mínimo 2 caracteres'),
  lastName: z.string().min(2, 'Mínimo 2 caracteres'),
  role: z.enum(['cashier', 'admin', 'owner']),
  branchId: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.password && data.password.length >= 8 && data.password !== data.confirmPassword) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Las contraseñas no coinciden',
      path: ['confirmPassword'],
    });
  }
});

export type UserForm = z.infer<typeof userSchema>;
