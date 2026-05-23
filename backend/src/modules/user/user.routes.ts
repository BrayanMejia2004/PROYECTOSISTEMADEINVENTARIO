import { Router } from 'express';
import { validate } from '../../middlewares/validate/validate.middleware';
import { checkPermission } from '../../middlewares/authorize/authorize.middleware';
import { authenticate } from '../../middlewares/auth/auth.middleware';
import { resolveTenant as resolveTenantMiddleware } from '../../middlewares/tenant/tenant.middleware';
import * as userController from './user.controller';
import { createUserSchema, updateUserSchema } from './user.schema';

const router = Router();

router.use(authenticate, resolveTenantMiddleware);

router.get('/', checkPermission('users:read'), userController.getUsers);
router.get('/:id', checkPermission('users:read'), userController.getUser);
router.post('/', checkPermission('users:create-cashier'), validate(createUserSchema), userController.createUser);
router.patch('/:id', checkPermission('users:create-cashier'), validate(updateUserSchema), userController.updateUser);
router.delete('/:id', checkPermission('users:create-cashier'), userController.deleteUser);

export default router;
