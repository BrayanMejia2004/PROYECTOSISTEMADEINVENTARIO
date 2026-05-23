import { Router } from 'express';
import { validate } from '../../middlewares/validate/validate.middleware';
import { checkPermission } from '../../middlewares/authorize/authorize.middleware';
import { authenticate } from '../../middlewares/auth/auth.middleware';
import { resolveTenant as resolveTenantMiddleware } from '../../middlewares/tenant/tenant.middleware';
import * as brandController from './brand.controller';
import { createBrandSchema, updateBrandSchema } from './brand.schema';

const router = Router();

router.use(authenticate, resolveTenantMiddleware);

router.get('/',     checkPermission('inventory:read', true),   brandController.getBrands);
router.get('/:id',  checkPermission('inventory:read', true),   brandController.getBrand);
router.post('/',    checkPermission('inventory:create', true), validate(createBrandSchema), brandController.createBrand);
router.patch('/:id', checkPermission('inventory:update', true), validate(updateBrandSchema), brandController.updateBrand);
router.delete('/:id', checkPermission('inventory:delete', true), brandController.deleteBrand);

export default router;
