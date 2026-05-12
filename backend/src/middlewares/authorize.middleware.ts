import { Request, Response, NextFunction } from 'express';
import { PERMISSIONS } from '../config/permissions';
import { ApiError } from '../utils/ApiError';
import { AuthRequest } from '../types/express';

export const checkPermission = (permission: keyof typeof PERMISSIONS, ownBranchOnly: boolean = false) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Not authenticated');
      }

      const allowedRoles = PERMISSIONS[permission] as readonly string[];
      if (!allowedRoles.includes(req.user.role)) {
        throw ApiError.forbidden(`Missing permission: ${permission}`);
      }

      if (ownBranchOnly && req.user.role !== 'owner') {
        if (!req.user.branchId) {
          throw ApiError.forbidden('Branch ID required');
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
