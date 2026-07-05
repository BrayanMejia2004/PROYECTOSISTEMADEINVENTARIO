import { Router } from 'express';
import { validate } from '../../middlewares/validate/validate.middleware';
import { checkPermission } from '../../middlewares/authorize/authorize.middleware';
import { authenticate } from '../../middlewares/auth/auth.middleware';
import { ApiError } from '../../shared/utils/apiError/ApiError';
import { resolveTenant as resolveTenantMiddleware } from '../../middlewares/tenant/tenant.middleware';
import * as supplierController from './supplier.controller';
import { createSupplierSchema, updateSupplierSchema } from './supplier.schema';

const router = Router();

router.use(authenticate, resolveTenantMiddleware);
router.param('id', (req, _res, next, id) => {
  if (!/^[0-9a-fA-F]{24}$/.test(id)) return next(ApiError.badRequest(`ID inválido: ${id}`));
  next();
});

router.get('/', checkPermission('suppliers:read', true), supplierController.getSuppliers);
router.get('/:id', checkPermission('suppliers:read', true), supplierController.getSupplier);
router.post('/', checkPermission('suppliers:create', true), validate(createSupplierSchema), supplierController.createSupplier);
router.patch('/:id', checkPermission('suppliers:update', true), validate(updateSupplierSchema), supplierController.updateSupplier);
router.delete('/:id', checkPermission('suppliers:delete', true), supplierController.deleteSupplier);

export default router;
