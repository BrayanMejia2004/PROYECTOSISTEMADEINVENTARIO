import { Router } from 'express';
import { validate } from '../../middlewares/validate/validate.middleware';
import { registerTenant, login, getProfile } from './auth.controller';
import { authenticate } from '../../middlewares/auth/auth.middleware';
import { resolveTenant } from '../../middlewares/tenant/tenant.middleware';
import { checkPermission } from '../../middlewares/authorize/authorize.middleware';
import { registerSchema, loginSchema } from './auth.schema';

const router = Router();

router.post('/register-tenant', validate(registerSchema), registerTenant);
router.post('/login', validate(loginSchema), login);
router.get('/profile', authenticate, resolveTenant, checkPermission('inventory:read'), getProfile);

export default router;
