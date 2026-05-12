import { Router } from 'express';
import { validate } from '../middlewares/validate.middleware';
import { checkPermission } from '../middlewares/authorize.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { resolveTenant } from '../middlewares/tenant.middleware';
import * as productController from '../controllers/product.controller';
import { z } from 'zod';

const router = Router();

const createProductSchema = z.object({
  sku: z.string().min(1, 'SKU requerido'),
  barcode: z.string().min(1, 'Código de barras requerido'),
  name: z.string().min(2, 'Nombre mínimo 2 caracteres'),
  description: z.string().optional(),
  departmentId: z.string().min(1, 'Departamento requerido'),
  brandId: z.string().min(1, 'Marca requerida'),
  supplierId: z.string().optional(),
  image: z.string().optional(),
  costPrice: z.number().min(0, 'Precio costo debe ser positivo'),
  price: z.number().min(0, 'Precio venta debe ser positivo'),
  wholesalePrice: z.number().min(0).optional(),
  specialPrice: z.number().min(0).optional(),
  applyTax: z.boolean().optional(),
  taxPercentage: z.number().min(0).max(100).optional(),
  allowsDiscount: z.boolean().optional(),
  maxDiscount: z.number().min(0).max(100).optional(),
  minStock: z.number().min(0, 'Stock mínimo debe ser positivo'),
  maxStock: z.number().min(0, 'Stock máximo debe ser positivo'),
  sellOutOfStock: z.boolean().optional(),
  unit: z.string().min(1, 'Unidad requerida'),
});

const updateProductSchema = z.object({
  sku: z.string().min(1).optional(),
  barcode: z.string().optional(),
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  departmentId: z.string().optional(),
  brandId: z.string().optional(),
  supplierId: z.string().optional(),
  image: z.string().optional(),
  costPrice: z.number().min(0).optional(),
  price: z.number().min(0).optional(),
  wholesalePrice: z.number().min(0).optional(),
  specialPrice: z.number().min(0).optional(),
  applyTax: z.boolean().optional(),
  taxPercentage: z.number().min(0).max(100).optional(),
  allowsDiscount: z.boolean().optional(),
  maxDiscount: z.number().min(0).max(100).optional(),
  minStock: z.number().min(0).optional(),
  maxStock: z.number().min(0).optional(),
  sellOutOfStock: z.boolean().optional(),
  unit: z.string().optional(),
});

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
