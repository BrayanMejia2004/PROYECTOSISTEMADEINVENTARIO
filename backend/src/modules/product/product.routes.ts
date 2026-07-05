import { Router } from 'express';
import { z } from 'zod';
import { validate, validateParams } from '../../middlewares/validate/validate.middleware';
import { sanitizePagination } from '../../middlewares/validate/query.middleware';
import { checkPermission } from '../../middlewares/authorize/authorize.middleware';
import { authenticate } from '../../middlewares/auth/auth.middleware';
import { resolveTenant } from '../../middlewares/tenant/tenant.middleware';
import * as productController from './product.controller';
import * as productBulkController from './product-bulk.controller';
import * as productImageController from './product-image.controller';
import { createProductSchema, updateProductSchema, importProductsSchema } from './product.schema';
import { uploadImage } from '../../middlewares/upload/upload.middleware';
import { objectId } from '../../shared/validation/common.schema';

const router = Router();

router.use(authenticate, resolveTenant);

const validateProductId = validateParams(z.object({ id: objectId }));

router.get('/', checkPermission('inventory:read', true), sanitizePagination, productController.getProducts);
router.get('/export', checkPermission('inventory:read', true), productBulkController.exportProducts);
router.post('/import', checkPermission('inventory:create', true), validate(importProductsSchema), productBulkController.importProducts);
router.post('/upload-image', authenticate, resolveTenant, checkPermission('inventory:create'), uploadImage, productImageController.uploadProductImage);
router.get('/barcode/:barcode', checkPermission('inventory:read', true), productController.getProductByBarcode);
router.get('/:id', validateProductId, checkPermission('inventory:read', true), productController.getProduct);
router.post('/', checkPermission('inventory:create'), validate(createProductSchema), productController.createProduct);
router.patch('/:id', validateProductId, checkPermission('inventory:update'), validate(updateProductSchema), productController.updateProduct);
router.delete('/:id', validateProductId, checkPermission('inventory:delete'), productController.deleteProduct);

export default router;
