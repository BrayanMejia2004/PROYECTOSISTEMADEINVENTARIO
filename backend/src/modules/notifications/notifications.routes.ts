import { Router } from 'express';
import { authenticate } from '../../middlewares/auth/auth.middleware';
import { ApiError } from '../../shared/utils/apiError/ApiError';
import { resolveTenant } from '../../middlewares/tenant/tenant.middleware';
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead } from './notifications.controller';

const router = Router();

router.use(authenticate, resolveTenant);
router.param('id', (req, _res, next, id) => {
  if (!/^[0-9a-fA-F]{24}$/.test(id)) return next(ApiError.badRequest(`ID inválido: ${id}`));
  next();
});

router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.patch('/:id/read', markAsRead);
router.patch('/read-all', markAllAsRead);

export default router;
