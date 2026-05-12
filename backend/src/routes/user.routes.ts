import { Router } from 'express';
import { validate } from '../middlewares/validate.middleware';
import { checkPermission } from '../middlewares/authorize.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { resolveTenant as resolveTenantMiddleware } from '../middlewares/tenant.middleware';
import * as userController from '../controllers/user.controller';
import { z } from 'zod';

const router = Router();

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  role: z.enum(['cashier', 'admin', 'owner']),
  branchId: z.string().optional(),
});

const updateUserSchema = z.object({
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  role: z.enum(['cashier', 'admin', 'owner']).optional(),
  branchId: z.string().optional(),
  isActive: z.boolean().optional(),
});

router.use(authenticate, resolveTenantMiddleware);

router.get('/', checkPermission('users:read'), userController.getUsers);
router.get('/:id', checkPermission('users:read'), userController.getUser);
router.post('/', checkPermission('users:create-cashier'), validate(createUserSchema), userController.createUser);
router.patch('/:id', checkPermission('users:create-cashier'), validate(updateUserSchema), userController.updateUser);
router.delete('/:id', checkPermission('users:create-cashier'), userController.deleteUser);

export default router;
