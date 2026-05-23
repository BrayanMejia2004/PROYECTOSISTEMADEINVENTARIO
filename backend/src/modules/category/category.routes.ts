import { Router } from 'express';
import { validate } from '../../middlewares/validate/validate.middleware';
import { checkPermission } from '../../middlewares/authorize/authorize.middleware';
import { authenticate } from '../../middlewares/auth/auth.middleware';
import { resolveTenant as resolveTenantMiddleware } from '../../middlewares/tenant/tenant.middleware';
import * as categoryController from './category.controller';
import { createCategorySchema, updateCategorySchema } from './category.schema';

const router = Router();

router.use(authenticate, resolveTenantMiddleware);

router.get('/', checkPermission('inventory:read', true), categoryController.getCategories);
router.get('/:id', checkPermission('inventory:read', true), categoryController.getCategory);
router.post('/', checkPermission('inventory:create', true), validate(createCategorySchema), categoryController.createCategory);
router.patch('/:id', checkPermission('inventory:update', true), validate(updateCategorySchema), categoryController.updateCategory);
router.delete('/:id', checkPermission('inventory:delete', true), categoryController.deleteCategory);

export default router;
