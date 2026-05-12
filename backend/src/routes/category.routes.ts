import { Router } from 'express';
import { validate } from '../middlewares/validate.middleware';
import { checkPermission } from '../middlewares/authorize.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { resolveTenant as resolveTenantMiddleware } from '../middlewares/tenant.middleware';
import * as categoryController from '../controllers/category.controller';
import { z } from 'zod';

const router = Router();

const createCategorySchema = z.object({
  name: z.string().min(2),
  parentId: z.string().optional(),
});

const updateCategorySchema = z.object({
  name: z.string().min(2).optional(),
  parentId: z.string().optional(),
  isActive: z.boolean().optional(),
});

router.use(authenticate, resolveTenantMiddleware);

router.get('/', checkPermission('inventory:read', true), categoryController.getCategories);
router.get('/:id', checkPermission('inventory:read', true), categoryController.getCategory);
router.post('/', checkPermission('inventory:create', true), validate(createCategorySchema), categoryController.createCategory);
router.patch('/:id', checkPermission('inventory:update', true), validate(updateCategorySchema), categoryController.updateCategory);
router.delete('/:id', checkPermission('inventory:delete', true), categoryController.deleteCategory);

export default router;
