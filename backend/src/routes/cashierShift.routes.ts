import { Router } from 'express';
import { checkPermission } from '../middlewares/authorize.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { resolveTenant } from '../middlewares/tenant.middleware';
import * as cashierShiftController from '../controllers/cashierShift.controller';

const router = Router();

router.use(authenticate, resolveTenant);

router.get('/', checkPermission('sales:create', true), cashierShiftController.getShifts);
router.post('/open', checkPermission('sales:create', true), cashierShiftController.openShift);
router.post('/:id/close', checkPermission('sales:create', true), cashierShiftController.closeShift);
router.get('/current', checkPermission('sales:create', true), cashierShiftController.getCurrentShift);
router.get('/:id', checkPermission('sales:create', true), cashierShiftController.getShift);
router.get('/:shiftId/movements', checkPermission('sales:create', true), cashierShiftController.getMovements);
router.post('/:shiftId/movements', checkPermission('sales:create', true), cashierShiftController.createMovement);

export default router;
