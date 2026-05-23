import { Router } from 'express';
import { validate } from '../../middlewares/validate/validate.middleware';
import { checkPermission } from '../../middlewares/authorize/authorize.middleware';
import { authenticate } from '../../middlewares/auth/auth.middleware';
import { resolveTenant as resolveTenantMiddleware } from '../../middlewares/tenant/tenant.middleware';
import * as departmentController from './department.controller';
import { createDepartmentSchema, updateDepartmentSchema } from './department.schema';

const router = Router();

router.use(authenticate, resolveTenantMiddleware);

router.get('/', checkPermission('inventory:read', true), departmentController.getDepartments);
router.get('/:id', checkPermission('inventory:read', true), departmentController.getDepartment);
router.post('/', checkPermission('inventory:create', true), validate(createDepartmentSchema), departmentController.createDepartment);
router.patch('/:id', checkPermission('inventory:update', true), validate(updateDepartmentSchema), departmentController.updateDepartment);
router.delete('/:id', checkPermission('inventory:delete', true), departmentController.deleteDepartment);

export default router;
