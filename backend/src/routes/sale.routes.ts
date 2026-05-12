import { Router } from 'express';
import { validate } from '../middlewares/validate.middleware';
import { checkPermission } from '../middlewares/authorize.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { resolveTenant as resolveTenantMiddleware } from '../middlewares/tenant.middleware';
import * as saleController from '../controllers/sale.controller';
import { z } from 'zod';

const router = Router();

const saleItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().min(1),
  unitPrice: z.number().min(0),
});

const createSaleSchema = z.object({
  customerName: z.string().optional(),
  items: z.array(saleItemSchema).min(1, 'At least one item is required'),
  tax: z.number().min(0).optional(),
  discount: z.number().min(0).optional(),
  paymentMethod: z.enum(['cash', 'card', 'transfer']),
});

router.use(authenticate, resolveTenantMiddleware);

router.get('/summary', checkPermission('sales:read', true), saleController.getSalesSummary);
router.get('/', checkPermission('sales:read', true), saleController.getSales);
router.post('/', checkPermission('sales:create', true), validate(createSaleSchema), saleController.createSale);
router.get('/:id', checkPermission('sales:read', true), saleController.getSale);
router.post('/:id/refund', checkPermission('sales:refund', true), saleController.refundSale);

export default router;
