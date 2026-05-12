import { Router } from 'express';
import { validate } from '../middlewares/validate.middleware';
import { checkPermission } from '../middlewares/authorize.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { resolveTenant as resolveTenantMiddleware } from '../middlewares/tenant.middleware';
import * as branchController from '../controllers/branch.controller';
import { z } from 'zod';

const router = Router();

const createBranchSchema = z.object({
  name: z.string().min(2),
  address: z.string().optional(),
  phone: z.string().optional(),
});

const updateBranchSchema = z.object({
  name: z.string().min(2).optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  isActive: z.boolean().optional(),
});

router.use(authenticate, resolveTenantMiddleware);

router.get('/', checkPermission('branches:read'), branchController.getBranches);
router.get('/:id', checkPermission('branches:read'), branchController.getBranch);
router.post('/', checkPermission('tenant:manage-branches'), validate(createBranchSchema), branchController.createBranch);
router.patch('/:id', checkPermission('tenant:manage-branches'), validate(updateBranchSchema), branchController.updateBranch);
router.delete('/:id', checkPermission('tenant:manage-branches'), branchController.deleteBranch);

export default router;
