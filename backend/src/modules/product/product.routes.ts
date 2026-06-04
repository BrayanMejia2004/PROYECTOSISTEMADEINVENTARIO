import { Router } from 'express';
import { validate } from '../../middlewares/validate/validate.middleware';
import { sanitizePagination } from '../../middlewares/validate/query.middleware';
import { checkPermission } from '../../middlewares/authorize/authorize.middleware';
import { authenticate } from '../../middlewares/auth/auth.middleware';
import { resolveTenant } from '../../middlewares/tenant/tenant.middleware';
import * as productController from './product.controller';
import { createProductSchema, updateProductSchema, importProductsSchema } from './product.schema';
import { uploadImage } from '../../middlewares/upload/upload.middleware';

const router = Router();

router.use(authenticate, resolveTenant);

router.get('/', checkPermission('inventory:read', true), sanitizePagination, productController.getProducts);
router.get('/export', checkPermission('inventory:read', true), productController.exportProducts);
router.post('/import', checkPermission('inventory:create', true), validate(importProductsSchema), productController.importProducts);
router.post('/upload-image', authenticate, resolveTenant, checkPermission('inventory:create'), uploadImage, productController.uploadProductImage);
router.get('/barcode/:barcode', checkPermission('inventory:read', true), productController.getProductByBarcode);
router.get('/:id', checkPermission('inventory:read', true), productController.getProduct);
router.post('/', checkPermission('inventory:create'), validate(createProductSchema), productController.createProduct);
router.patch('/:id', checkPermission('inventory:update'), validate(updateProductSchema), productController.updateProduct);
router.delete('/:id', checkPermission('inventory:delete'), productController.deleteProduct);

export default router;
