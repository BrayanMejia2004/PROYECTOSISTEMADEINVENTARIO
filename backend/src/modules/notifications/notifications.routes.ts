import { Router } from 'express';
import { authenticate } from '../../middlewares/auth/auth.middleware';
import { resolveTenant } from '../../middlewares/tenant/tenant.middleware';
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead } from './notifications.controller';

const router = Router();

router.use(authenticate, resolveTenant);

router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.patch('/:id/read', markAsRead);
router.patch('/read-all', markAllAsRead);

export default router;
