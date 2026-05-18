import { Router } from 'express';
import { validate } from '../middlewares/validate.middleware';
import { checkPermission } from '../middlewares/authorize.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { resolveTenant as resolveTenantMiddleware } from '../middlewares/tenant.middleware';
import * as brandController from '../controllers/brand.controller';
import { z } from 'zod';

const router = Router();

const createBrandSchema = z.object({
  name: z.string().min(1, 'Brand name is required'),
});

const updateBrandSchema = z.object({
  name: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
});

router.use(authenticate, resolveTenantMiddleware);

router.get('/',     checkPermission('inventory:read', true),   brandController.getBrands);
router.get('/:id',  checkPermission('inventory:read', true),   brandController.getBrand);
router.post('/',    checkPermission('inventory:create', true), validate(createBrandSchema), brandController.createBrand);
router.patch('/:id', checkPermission('inventory:update', true), validate(updateBrandSchema), brandController.updateBrand);
router.delete('/:id', checkPermission('inventory:delete', true), brandController.deleteBrand);

export default router;
