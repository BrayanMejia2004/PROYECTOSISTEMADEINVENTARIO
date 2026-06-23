import { Response, NextFunction } from 'express';
import { hasPermission, type Permission, type Role } from '../../config/permissions/permissions';
import { ApiError } from '../../shared/utils/apiError/ApiError';
import { logger } from '../../config/logger/logger';
import { AuthRequest } from '../../shared/types/express/express';

export const checkPermission = (permission: Permission, ownBranchOnly: boolean = false) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('No autenticado');
      }

      if (!hasPermission(req.user.role as Role, permission)) {
        throw ApiError.forbidden(`Permiso requerido: ${permission}`);
      }

      if (ownBranchOnly && req.user.role !== 'owner') {
        if (!req.user.branchId) {
          throw ApiError.forbidden('ID de sucursal requerido');
        }
      }

      next();
    } catch (error) {
      if (error instanceof ApiError) {
        logger.warn(`Error de autorización: ${error.message}`, {
          permission,
          userId: req.user?.userId,
          role: req.user?.role,
        });
      } else {
        logger.error(`Error inesperado de autorización: ${error instanceof Error ? error.message : String(error)}`);
      }
      next(error);
    }
  };
};
