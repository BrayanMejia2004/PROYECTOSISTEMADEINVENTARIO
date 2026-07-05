import { Router } from 'express';
import { z } from 'zod';
import { validate, validateParams } from '../../middlewares/validate/validate.middleware';
import { sanitizePagination } from '../../middlewares/validate/query.middleware';
import { checkPermission } from '../../middlewares/authorize/authorize.middleware';
import { authenticate } from '../../middlewares/auth/auth.middleware';
import { resolveTenant as resolveTenantMiddleware } from '../../middlewares/tenant/tenant.middleware';
import * as saleController from './sale.controller';
import * as salePdfController from './sale-pdf.controller';
import { createSaleSchema } from './sale.schema';
import { objectId } from '../../shared/validation/common.schema';

const router = Router();

router.use(authenticate, resolveTenantMiddleware);

const validateSaleId = validateParams(z.object({ id: objectId }));

router.get('/transfers', checkPermission('sales:read', true), sanitizePagination, saleController.getTransferSales);
router.get('/summary', checkPermission('sales:read', true), saleController.getSalesSummary);
router.get('/', checkPermission('sales:read', true), sanitizePagination, saleController.getSales);
router.get('/by-number/:saleNumber', checkPermission('sales:read', true), saleController.getSaleByNumber);
router.post('/', checkPermission('sales:create', true), validate(createSaleSchema), saleController.createSale);
router.get('/:id/pdf', validateSaleId, checkPermission('sales:read', true), salePdfController.getSalePdf);
router.get('/:id', validateSaleId, checkPermission('sales:read', true), saleController.getSale);
router.post('/:id/refund', validateSaleId, checkPermission('sales:refund', true), saleController.refundSale);

export default router;
