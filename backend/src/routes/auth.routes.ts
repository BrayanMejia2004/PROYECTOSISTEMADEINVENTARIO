import { Router } from 'express';
import { validate } from '../middlewares/validate.middleware';
import { registerTenant, login, getProfile } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { resolveTenant } from '../middlewares/tenant.middleware';
import { checkPermission } from '../middlewares/authorize.middleware';
import { z } from 'zod';

const router = Router();

const registerSchema = z.object({
  tenantName: z.string().min(2),
  tenantSlug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  tenantSlug: z.string().min(1),
});

router.post('/register-tenant', validate(registerSchema), registerTenant);
router.post('/login', validate(loginSchema), login);
router.get('/profile', authenticate, resolveTenant, checkPermission('inventory:read'), getProfile);

export default router;
