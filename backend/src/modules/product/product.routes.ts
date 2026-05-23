import { Router } from 'express';
import { validate } from '../../middlewares/validate/validate.middleware';
import { checkPermission } from '../../middlewares/authorize/authorize.middleware';
import { authenticate } from '../../middlewares/auth/auth.middleware';
import { resolveTenant } from '../../middlewares/tenant/tenant.middleware';
import * as productController from './product.controller';
import { createProductSchema, updateProductSchema } from './product.schema';

const router = Router();

router.use(authenticate, resolveTenant);

router.get('/', checkPermission('inventory:read', true), productController.getProducts);
router.get('/export', checkPermission('inventory:read', true), productController.exportProducts);
router.post('/import', checkPermission('inventory:create', true), productController.importProducts);
router.get('/barcode/:barcode', checkPermission('inventory:read', true), productController.getProductByBarcode);
router.get('/:id', checkPermission('inventory:read', true), productController.getProduct);
router.post('/', checkPermission('inventory:create'), validate(createProductSchema), productController.createProduct);
router.patch('/:id', checkPermission('inventory:update'), validate(updateProductSchema), productController.updateProduct);
router.delete('/:id', checkPermission('inventory:delete'), productController.deleteProduct);

export default router;
