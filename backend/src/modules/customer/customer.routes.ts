import { Router } from 'express';
import { validate } from '../../middlewares/validate/validate.middleware';
import { sanitizePagination } from '../../middlewares/validate/query.middleware';
import { checkPermission } from '../../middlewares/authorize/authorize.middleware';
import { authenticate } from '../../middlewares/auth/auth.middleware';
import { ApiError } from '../../shared/utils/apiError/ApiError';
import { resolveTenant } from '../../middlewares/tenant/tenant.middleware';
import * as customerController from './customer.controller';
import { createCustomerSchema, updateCustomerSchema } from './customer.schema';

const router = Router();

router.use(authenticate, resolveTenant);
router.param('id', (req, _res, next, id) => {
  if (!/^[0-9a-fA-F]{24}$/.test(id)) return next(ApiError.badRequest(`ID inválido: ${id}`));
  next();
});

router.get('/', checkPermission('sales:read', true), sanitizePagination, customerController.getCustomers);
router.get('/:id', checkPermission('sales:read', true), customerController.getCustomer);
router.post('/', checkPermission('sales:create', true), validate(createCustomerSchema), customerController.createCustomer);
router.patch('/:id', checkPermission('sales:read', true), validate(updateCustomerSchema), customerController.updateCustomer);
router.delete('/:id', checkPermission('sales:read', true), customerController.deleteCustomer);

export default router;
