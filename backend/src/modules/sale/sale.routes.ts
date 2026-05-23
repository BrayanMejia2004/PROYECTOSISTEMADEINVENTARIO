import { Router } from 'express';
import { validate } from '../../middlewares/validate/validate.middleware';
import { checkPermission } from '../../middlewares/authorize/authorize.middleware';
import { authenticate } from '../../middlewares/auth/auth.middleware';
import { resolveTenant as resolveTenantMiddleware } from '../../middlewares/tenant/tenant.middleware';
import * as saleController from './sale.controller';
import { createSaleSchema } from './sale.schema';

const router = Router();

router.use(authenticate, resolveTenantMiddleware);

router.get('/transfers', checkPermission('sales:read', true), saleController.getTransferSales);
router.get('/summary', checkPermission('sales:read', true), saleController.getSalesSummary);
router.get('/', checkPermission('sales:read', true), saleController.getSales);
router.get('/by-number/:saleNumber', checkPermission('sales:read', true), saleController.getSaleByNumber);
router.post('/', checkPermission('sales:create', true), validate(createSaleSchema), saleController.createSale);
router.get('/:id/pdf', checkPermission('sales:read', true), saleController.getSalePdf);
router.get('/:id', checkPermission('sales:read', true), saleController.getSale);
router.post('/:id/refund', checkPermission('sales:refund', true), saleController.refundSale);

export default router;
