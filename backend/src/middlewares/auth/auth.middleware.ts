import { Response, NextFunction } from 'express';
import { verifyToken } from '../../shared/utils/jwt/jwt';
import { ApiError } from '../../shared/utils/apiError/ApiError';
import { AuthRequest } from '../../shared/types/express/express';
import User from '../../shared/models/user/user.model';

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const cookieToken = req.cookies?.token;
    const authHeader = req.headers.authorization;

    let token: string | undefined;
    if (cookieToken) {
      token = cookieToken;
    } else if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      throw ApiError.unauthorized('No token provided');
    }

    const payload = verifyToken(token);

    if (payload.tokenVersion !== undefined) {
      const user = await User.findById(payload.userId).select('tokenVersion isActive').lean();
      if (!user || !user.isActive) {
        throw ApiError.unauthorized('Usuario no encontrado o inactivo');
      }
      if (user.tokenVersion !== payload.tokenVersion) {
        throw ApiError.unauthorized('Sesión inválida. Inicia sesión nuevamente.');
      }
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
