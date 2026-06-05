import { Response, NextFunction } from 'express';
import { verifyAccessToken } from '../../shared/utils/jwt/jwt';
import { ApiError } from '../../shared/utils/apiError/ApiError';
import { AuthRequest } from '../../shared/types/express/express';
import User from '../../shared/models/user/user.model';

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Token de acceso requerido');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw ApiError.unauthorized('Token de acceso requerido');
    }

    const payload = verifyAccessToken(token);

    const user = await User.findById(payload.userId).select('tokenVersion isActive').lean();
    if (!user || !user.isActive) {
      throw ApiError.unauthorized('Usuario no encontrado o inactivo');
    }
    if (user.tokenVersion !== payload.tokenVersion) {
      throw ApiError.unauthorized('Sesión inválida. Inicia sesión nuevamente.');
    }

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
