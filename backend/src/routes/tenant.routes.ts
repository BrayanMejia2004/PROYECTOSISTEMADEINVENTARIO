import { Router } from 'express';
import { validate } from '../middlewares/validate.middleware';
import { checkPermission } from '../middlewares/authorize.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { resolveTenant as resolveTenantMiddleware } from '../middlewares/tenant.middleware';
import * as tenantController from '../controllers/tenant.controller';
import { z } from 'zod';

const router = Router();

const updateSettingsSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  nit: z.string().optional(),
});

router.use(authenticate, resolveTenantMiddleware);

router.get('/', checkPermission('tenant:manage-branches'), tenantController.getTenant);
router.patch('/settings', checkPermission('tenant:manage-branches'), validate(updateSettingsSchema), tenantController.updateTenant);

export default router;
