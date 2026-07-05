import { Response } from 'express';
import mongoose from 'mongoose';
import Notification from '../../shared/models/notification/notification.model';
import { sendSuccess } from '../../shared/utils/apiResponse/ApiResponse';
import { asyncHandler } from '../../shared/utils/asyncHandler/asyncHandler';
import { ApiError } from '../../shared/utils/apiError/ApiError';
import { AuthRequest } from '../../shared/types/express/express';

export const getNotifications = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenantId = req.user?.tenantId;
  if (!tenantId) throw ApiError.unauthorized('Tenant ID requerido');

  const limit = Math.min(100, parseInt(req.query.limit as string) || 50); // eslint-disable-line @typescript-eslint/prefer-nullish-coalescing -- 0 is invalid here

  const notifications = await Notification.find({
    tenantId,
    forRole: { $in: ['tenant', 'all'] },
  }).sort({ createdAt: -1 }).limit(limit).lean();

  sendSuccess(res, 'Notificaciones obtenidas', notifications);
});

export const getUnreadCount = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenantId = req.user?.tenantId;
  if (!tenantId) throw ApiError.unauthorized('Tenant ID requerido');

  const count = await Notification.countDocuments({
    tenantId,
    forRole: { $in: ['tenant', 'all'] },
    read: false,
  });

  sendSuccess(res, 'Conteo obtenido', { count });
});

export const markAsRead = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenantId = req.user?.tenantId;
  if (!tenantId) throw ApiError.unauthorized('Tenant ID requerido');

  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw ApiError.badRequest('ID inválido');
  }

  const notification = await Notification.findOneAndUpdate(
    { _id: id, tenantId },
    { read: true },
    { new: true }
  ).lean();

  if (!notification) throw ApiError.notFound('Notificación no encontrada');

  sendSuccess(res, 'Notificación marcada como leída', notification);
});

export const markAllAsRead = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenantId = req.user?.tenantId;
  if (!tenantId) throw ApiError.unauthorized('Tenant ID requerido');

  await Notification.updateMany(
    { tenantId, forRole: { $in: ['tenant', 'all'] }, read: false },
    { read: true }
  );

  sendSuccess(res, 'Todas las notificaciones marcadas como leídas');
});
