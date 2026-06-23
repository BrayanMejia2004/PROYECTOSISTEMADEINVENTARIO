import { z } from 'zod';
import 'dotenv/config';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),
  RATE_LIMIT_MAX: z.coerce.number().default(100),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  CORS_ORIGINS: z.string().default('http://localhost:5173'),

}).superRefine((data, ctx) => {
  const cloudinaryVars = [data.CLOUDINARY_CLOUD_NAME, data.CLOUDINARY_API_KEY, data.CLOUDINARY_API_SECRET];
  const somePresent = cloudinaryVars.some(v => v !== undefined);
  const allPresent = cloudinaryVars.every(v => v !== undefined);

  if (somePresent && !allPresent) {
    const missing: string[] = [];
    if (!data.CLOUDINARY_CLOUD_NAME) missing.push('CLOUDINARY_CLOUD_NAME');
    if (!data.CLOUDINARY_API_KEY) missing.push('CLOUDINARY_API_KEY');
    if (!data.CLOUDINARY_API_SECRET) missing.push('CLOUDINARY_API_SECRET');
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Todas las variables de Cloudinary deben configurarse juntas. Faltan: ${missing.join(', ')}`,
    });
  }
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const { fieldErrors, formErrors } = parsed.error.flatten();
  const messages: string[] = [];

  for (const [field, errors] of Object.entries(fieldErrors)) {
    if (errors && errors.length > 0) {
      messages.push(`  • ${field}: ${errors.join(', ')}`);
    }
  }
  for (const error of formErrors) {
    messages.push(`  • ${error}`);
  }

  throw new Error(`Variables de entorno inválidas:\n${messages.join('\n')}`);
}

export type Env = z.infer<typeof envSchema>;
export const env = parsed.data;
