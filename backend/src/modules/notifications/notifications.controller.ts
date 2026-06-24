import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Notification from '../../shared/models/notification/notification.model';
import { sendSuccess } from '../../shared/utils/apiResponse/ApiResponse';
import { logger } from '../../config/logger/logger';
import { ApiError } from '../../shared/utils/apiError/ApiError';
import { AuthRequest } from '../../shared/types/express/express';

export const getNotifications = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) throw ApiError.unauthorized('Tenant ID requerido');

    const limit = Math.min(100, parseInt(req.query.limit as string) || 50);

    const notifications = await Notification.find({
      tenantId,
      forRole: { $in: ['tenant', 'all'] },
    }).sort({ createdAt: -1 }).limit(limit).lean();

    sendSuccess(res, 'Notificaciones obtenidas', notifications);
  } catch (error) {
    logger.error(`Error en notificaciones: ${error instanceof Error ? error.message : String(error)}`);
    next(error);
  }
};

export const getUnreadCount = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) throw ApiError.unauthorized('Tenant ID requerido');

    const count = await Notification.countDocuments({
      tenantId,
      forRole: { $in: ['tenant', 'all'] },
      read: false,
    });

    sendSuccess(res, 'Conteo obtenido', { count });
  } catch (error) {
    logger.error(`Error en notificaciones: ${error instanceof Error ? error.message : String(error)}`);
    next(error);
  }
};

export const markAsRead = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
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
  } catch (error) {
    logger.error(`Error en notificaciones: ${error instanceof Error ? error.message : String(error)}`);
    next(error);
  }
};

export const markAllAsRead = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) throw ApiError.unauthorized('Tenant ID requerido');

    await Notification.updateMany(
      { tenantId, forRole: { $in: ['tenant', 'all'] }, read: false },
      { read: true }
    );

    sendSuccess(res, 'Todas las notificaciones marcadas como leídas');
  } catch (error) {
    logger.error(`Error en notificaciones: ${error instanceof Error ? error.message : String(error)}`);
    next(error);
  }
};
