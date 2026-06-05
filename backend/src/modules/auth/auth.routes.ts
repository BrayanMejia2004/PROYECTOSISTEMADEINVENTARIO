import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { validate } from '../../middlewares/validate/validate.middleware';
import { registerTenant, login, refresh, logout, getProfile } from './auth.controller';
import { authenticate } from '../../middlewares/auth/auth.middleware';
import { resolveTenant } from '../../middlewares/tenant/tenant.middleware';
import { registerSchema, loginSchema } from './auth.schema';
import { sendSuccess } from '../../shared/utils/apiResponse/ApiResponse';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Demasiados intentos de inicio de sesión. Inténtalo de nuevo más tarde.' },
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: { message: 'Demasiados registros. Inténtalo de nuevo más tarde.' },
});

router.post('/register-tenant', registerLimiter, validate(registerSchema), registerTenant);
router.post('/login', loginLimiter, validate(loginSchema), login);
router.post('/refresh', refresh);
router.get('/profile', authenticate, resolveTenant, getProfile);
router.post('/logout', logout);

export default router;
