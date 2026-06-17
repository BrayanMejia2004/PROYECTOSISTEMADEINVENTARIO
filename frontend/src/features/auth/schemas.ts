import { z } from 'zod';

export const registerTenantSchema = z.object({
  tenantName: z.string().min(2, 'Nombre mínimo 2 caracteres'),
  tenantSlug: z.string().min(2, 'Slug mínimo 2 caracteres').regex(/^[a-z0-9-]+$/),
  email: z.string().email('Email inválido'),
  password: z.string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número'),
  confirmPassword: z.string().min(1, 'Confirma tu contraseña'),
  firstName: z.string().min(2, 'Nombre mínimo 2 caracteres'),
  lastName: z.string().min(2, 'Apellido mínimo 2 caracteres'),
}).superRefine((data, ctx) => {
  if (data.password !== data.confirmPassword) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Las contraseñas no coinciden',
      path: ['confirmPassword'],
    });
  }
});

export type RegisterTenantForm = z.infer<typeof registerTenantSchema>;
