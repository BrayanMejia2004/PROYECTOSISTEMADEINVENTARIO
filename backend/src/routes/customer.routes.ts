import { Router } from 'express';
import { validate } from '../middlewares/validate.middleware';
import { checkPermission } from '../middlewares/authorize.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { resolveTenant } from '../middlewares/tenant.middleware';
import * as customerController from '../controllers/customer.controller';
import { z } from 'zod';

const router = Router();

const createCustomerSchema = z.object({
  name: z.string().min(2, 'Nombre mínimo 2 caracteres'),
  phone: z.string().optional(),
  email: z.string().email('Email inválido').optional(),
  address: z.string().optional(),
  taxId: z.string().optional(),
});

const updateCustomerSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  taxId: z.string().optional(),
  isActive: z.boolean().optional(),
});

router.use(authenticate, resolveTenant);

router.get('/', checkPermission('sales:read', true), customerController.getCustomers);
router.get('/:id', checkPermission('sales:read', true), customerController.getCustomer);
router.post('/', checkPermission('sales:create', true), validate(createCustomerSchema), customerController.createCustomer);
router.patch('/:id', checkPermission('sales:read', true), validate(updateCustomerSchema), customerController.updateCustomer);
router.delete('/:id', checkPermission('sales:read', true), customerController.deleteCustomer);

export default router;
