import { Router } from 'express';
import { validate } from '../../middlewares/validate/validate.middleware';
import { checkPermission } from '../../middlewares/authorize/authorize.middleware';
import { authenticate } from '../../middlewares/auth/auth.middleware';
import { ApiError } from '../../shared/utils/apiError/ApiError';
import { resolveTenant as resolveTenantMiddleware } from '../../middlewares/tenant/tenant.middleware';
import * as userController from './user.controller';
import { createUserSchema, updateUserSchema } from './user.schema';

const router = Router();

router.use(authenticate, resolveTenantMiddleware);
router.param('id', (req, _res, next, id) => {
  if (!/^[0-9a-fA-F]{24}$/.test(id)) return next(ApiError.badRequest(`ID inválido: ${id}`));
  next();
});

router.get('/', checkPermission('users:read'), userController.getUsers);
router.get('/:id', checkPermission('users:read'), userController.getUser);
router.post('/', checkPermission('users:create'), validate(createUserSchema), userController.createUser);
router.patch('/:id', checkPermission('users:update'), validate(updateUserSchema), userController.updateUser);
router.delete('/:id', checkPermission('users:delete'), userController.deleteUser);

export default router;
