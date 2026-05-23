import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../../shared/utils/jwt/jwt';
import { ApiError } from '../../shared/utils/apiError/ApiError';
import { AuthRequest } from '../../shared/types/express/express';

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw ApiError.unauthorized('No token provided');
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);

    req.user = {
      userId: payload.userId,
      tenantId: payload.tenantId,
      role: payload.role,
      branchId: payload.branchId,
    };

    next();
  } catch (error) {
    next(error);
  }
};
