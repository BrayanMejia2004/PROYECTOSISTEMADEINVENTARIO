import { Router } from 'express';
import { validate } from '../middlewares/validate.middleware';
import { checkPermission } from '../middlewares/authorize.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { resolveTenant } from '../middlewares/tenant.middleware';
import * as stockController from '../controllers/stock.controller';
import { z } from 'zod';

const router = Router();

const initializeStockSchema = z.object({
  productId: z.string().min(1),
  price: z.number().min(0),
  quantity: z.number().min(0).default(0),
  branchId: z.string().optional(),
});

const updatePriceSchema = z.object({
  price: z.number().min(0),
});

const adjustStockSchema = z.object({
  quantity: z.number().min(0),
  note: z.string().min(1),
});

router.use(authenticate, resolveTenant);

router.get('/', checkPermission('inventory:read', true), stockController.getStock);
router.get('/low', checkPermission('inventory:read', true), stockController.getLowStock);
router.post('/', checkPermission('inventory:create', true), validate(initializeStockSchema), stockController.initializeStock);
router.patch('/:productId/price', checkPermission('inventory:set-price', true), validate(updatePriceSchema), stockController.updatePrice);
router.post('/:productId/adjust', checkPermission('inventory:adjust', true), validate(adjustStockSchema), stockController.adjustStock);

export default router;
