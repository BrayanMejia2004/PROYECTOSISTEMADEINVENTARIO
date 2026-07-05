import { Router } from 'express';
import { checkPermission } from '../../middlewares/authorize/authorize.middleware';
import { authenticate } from '../../middlewares/auth/auth.middleware';
import { ApiError } from '../../shared/utils/apiError/ApiError';
import { resolveTenant } from '../../middlewares/tenant/tenant.middleware';
import * as cashierShiftController from './cashierShift.controller';

const router = Router();

router.use(authenticate, resolveTenant);
const validateObjectId = (id: string) => /^[0-9a-fA-F]{24}$/.test(id);
router.param('id', (req, _res, next, id) => {
  if (!validateObjectId(id)) return next(ApiError.badRequest(`ID inválido: ${id}`));
  next();
});
router.param('shiftId', (req, _res, next, id) => {
  if (!validateObjectId(id)) return next(ApiError.badRequest(`ID de turno inválido: ${id}`));
  next();
});

router.get('/', checkPermission('sales:create', true), cashierShiftController.getShifts);
router.post('/open', checkPermission('sales:create', true), cashierShiftController.openShift);
router.post('/:id/close', checkPermission('sales:create', true), cashierShiftController.closeShift);
router.get('/current', checkPermission('sales:create', true), cashierShiftController.getCurrentShift);
router.get('/:id', checkPermission('sales:create', true), cashierShiftController.getShift);
router.get('/:shiftId/movements', checkPermission('sales:create', true), cashierShiftController.getMovements);
router.post('/:shiftId/movements', checkPermission('sales:create', true), cashierShiftController.createMovement);

export default router;
