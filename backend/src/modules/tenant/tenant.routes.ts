import { Router } from 'express';
import { validate } from '../../middlewares/validate/validate.middleware';
import { checkPermission } from '../../middlewares/authorize/authorize.middleware';
import { authenticate } from '../../middlewares/auth/auth.middleware';
import { resolveTenant as resolveTenantMiddleware } from '../../middlewares/tenant/tenant.middleware';
import { uploadImage } from '../../middlewares/upload/upload.middleware';
import * as tenantController from './tenant.controller';
import { updateSettingsSchema } from './tenant.schema';

const router = Router();

router.use(authenticate, resolveTenantMiddleware);

router.get('/', checkPermission('tenant:manage-branches'), tenantController.getTenant);
router.patch('/settings', checkPermission('tenant:manage-branches'), validate(updateSettingsSchema), tenantController.updateTenant);
router.post('/logo', checkPermission('tenant:manage-branches'), uploadImage, tenantController.uploadLogo);

export default router;
