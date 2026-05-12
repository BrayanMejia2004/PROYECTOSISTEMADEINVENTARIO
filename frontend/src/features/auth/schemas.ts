import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Contraseña requerida'),
  tenantSlug: z.string().min(1, 'Slug del tenant requerido'),
});

export const registerTenantSchema = z.object({
  tenantName: z.string().min(2, 'Nombre mínimo 2 caracteres'),
  tenantSlug: z.string().min(2, 'Slug mínimo 2 caracteres').regex(/^[a-z0-9-]+$/),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Contraseña mínimo 8 caracteres'),
  firstName: z.string().min(2, 'Nombre mínimo 2 caracteres'),
  lastName: z.string().min(2, 'Apellido mínimo 2 caracteres'),
});

export type LoginForm = z.infer<typeof loginSchema>;
export type RegisterTenantForm = z.infer<typeof registerTenantSchema>;
