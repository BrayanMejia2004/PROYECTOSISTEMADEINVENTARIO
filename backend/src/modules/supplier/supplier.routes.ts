import { Router } from 'express';
import { validate } from '../../middlewares/validate/validate.middleware';
import { checkPermission } from '../../middlewares/authorize/authorize.middleware';
import { authenticate } from '../../middlewares/auth/auth.middleware';
import { resolveTenant as resolveTenantMiddleware } from '../../middlewares/tenant/tenant.middleware';
import * as supplierController from './supplier.controller';
import { createSupplierSchema, updateSupplierSchema } from './supplier.schema';

const router = Router();

router.use(authenticate, resolveTenantMiddleware);

router.get('/', checkPermission('suppliers:read', true), supplierController.getSuppliers);
router.get('/:id', checkPermission('suppliers:read', true), supplierController.getSupplier);
router.post('/', checkPermission('suppliers:read', true), validate(createSupplierSchema), supplierController.createSupplier);
router.patch('/:id', checkPermission('suppliers:read', true), validate(updateSupplierSchema), supplierController.updateSupplier);
router.delete('/:id', checkPermission('suppliers:read', true), supplierController.deleteSupplier);

export default router;
