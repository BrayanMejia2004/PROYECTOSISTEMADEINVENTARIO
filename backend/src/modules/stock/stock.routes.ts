import { Router } from 'express';
import { validate } from '../../middlewares/validate/validate.middleware';
import { checkPermission } from '../../middlewares/authorize/authorize.middleware';
import { authenticate } from '../../middlewares/auth/auth.middleware';
import { resolveTenant } from '../../middlewares/tenant/tenant.middleware';
import * as stockController from './stock.controller';
import { initializeStockSchema, updatePriceSchema, adjustStockSchema } from './stock.schema';

const router = Router();

router.use(authenticate, resolveTenant);

router.get('/', checkPermission('inventory:read', true), stockController.getStock);
router.get('/low', checkPermission('inventory:read', true), stockController.getLowStock);
router.post('/', checkPermission('inventory:create', true), validate(initializeStockSchema), stockController.initializeStock);
router.patch('/:productId/price', checkPermission('inventory:set-price', true), validate(updatePriceSchema), stockController.updatePrice);
router.post('/:productId/adjust', checkPermission('inventory:adjust', true), validate(adjustStockSchema), stockController.adjustStock);

export default router;
