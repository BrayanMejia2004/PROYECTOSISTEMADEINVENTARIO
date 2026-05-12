import { Router } from 'express';
import { checkPermission } from '../middlewares/authorize.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { resolveTenant as resolveTenantMiddleware } from '../middlewares/tenant.middleware';
import * as reportController from '../controllers/report.controller';

const router = Router();

router.use(authenticate, resolveTenantMiddleware);

router.get('/sales', checkPermission('reports:branch'), reportController.getSalesReport);
router.get('/inventory', checkPermission('reports:branch'), reportController.getInventoryReport);
router.get('/profitability', checkPermission('reports:branch'), reportController.getProfitabilityReport);
router.get('/branches', checkPermission('reports:global'), reportController.getBranchComparison);

export default router;
