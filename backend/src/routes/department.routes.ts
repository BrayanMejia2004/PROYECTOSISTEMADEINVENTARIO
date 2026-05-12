import { Router } from 'express';
import { validate } from '../middlewares/validate.middleware';
import { checkPermission } from '../middlewares/authorize.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { resolveTenant as resolveTenantMiddleware } from '../middlewares/tenant.middleware';
import * as departmentController from '../controllers/department.controller';
import { z } from 'zod';

const router = Router();

const createDepartmentSchema = z.object({
  name: z.string().min(2),
  parentId: z.string().optional(),
});

const updateDepartmentSchema = z.object({
  name: z.string().min(2).optional(),
  parentId: z.string().optional(),
  isActive: z.boolean().optional(),
});

router.use(authenticate, resolveTenantMiddleware);

router.get('/', checkPermission('inventory:read', true), departmentController.getDepartments);
router.get('/:id', checkPermission('inventory:read', true), departmentController.getDepartment);
router.post('/', checkPermission('inventory:create', true), validate(createDepartmentSchema), departmentController.createDepartment);
router.patch('/:id', checkPermission('inventory:update', true), validate(updateDepartmentSchema), departmentController.updateDepartment);
router.delete('/:id', checkPermission('inventory:delete', true), departmentController.deleteDepartment);

export default router;
