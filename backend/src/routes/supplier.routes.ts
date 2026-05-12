import { Router } from 'express';
import { validate } from '../middlewares/validate.middleware';
import { checkPermission } from '../middlewares/authorize.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { resolveTenant as resolveTenantMiddleware } from '../middlewares/tenant.middleware';
import * as supplierController from '../controllers/supplier.controller';
import { z } from 'zod';

const router = Router();

const createSupplierSchema = z.object({
  name: z.string().min(2),
  contactName: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  taxId: z.string().optional(),
});

const updateSupplierSchema = z.object({
  name: z.string().min(2).optional(),
  contactName: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  taxId: z.string().optional(),
  isActive: z.boolean().optional(),
});

router.use(authenticate, resolveTenantMiddleware);

router.get('/', checkPermission('suppliers:read', true), supplierController.getSuppliers);
router.get('/:id', checkPermission('suppliers:read', true), supplierController.getSupplier);
router.post('/', checkPermission('suppliers:read', true), validate(createSupplierSchema), supplierController.createSupplier);
router.patch('/:id', checkPermission('suppliers:read', true), validate(updateSupplierSchema), supplierController.updateSupplier);
router.delete('/:id', checkPermission('suppliers:read', true), supplierController.deleteSupplier);

export default router;
