import { Router } from 'express';
import { validate } from '../../middlewares/validate/validate.middleware';
import { checkPermission } from '../../middlewares/authorize/authorize.middleware';
import { authenticate } from '../../middlewares/auth/auth.middleware';
import { resolveTenant as resolveTenantMiddleware } from '../../middlewares/tenant/tenant.middleware';
import * as branchController from './branch.controller';
import { createBranchSchema, updateBranchSchema } from './branch.schema';

const router = Router();

router.use(authenticate, resolveTenantMiddleware);

router.get('/', checkPermission('branches:read'), branchController.getBranches);
router.get('/:id', checkPermission('branches:read'), branchController.getBranch);
router.post('/', checkPermission('tenant:manage-branches'), validate(createBranchSchema), branchController.createBranch);
router.patch('/:id', checkPermission('tenant:manage-branches'), validate(updateBranchSchema), branchController.updateBranch);
router.delete('/:id', checkPermission('tenant:manage-branches'), branchController.deleteBranch);

export default router;
