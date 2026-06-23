import { Response, NextFunction } from 'express';
import Tenant from '../../shared/models/tenant/tenant.model';
import { ApiError } from '../../shared/utils/apiError/ApiError';
import { logger } from '../../config/logger/logger';
import { AuthRequest } from '../../shared/types/express/express';

export const resolveTenant = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.tenantId) {
      throw ApiError.unauthorized('ID de tenant no encontrado');
    }

    const tenant = await Tenant.findById(req.user.tenantId);
    if (!tenant) {
      throw ApiError.notFound('Tenant no encontrado');
    }
    if (!tenant.isActive) {
      throw ApiError.forbidden('Su suscripción ha expirado. Contacte al administrador para reactivar el servicio.');
    }

    req.tenant = {
      _id: tenant._id.toString(),
      slug: tenant.slug,
      name: tenant.name,
      email: tenant.email,
      phone: tenant.phone ?? undefined,
      address: tenant.address ?? undefined,
      nit: tenant.nit ?? undefined,
      logo: tenant.logo ?? undefined,
      brandColor: tenant.brandColor ?? '#2D8A4E',
      brandColorLight: tenant.brandColorLight ?? '#6ABF8A',
      brandColorDark: tenant.brandColorDark ?? '#1E5A32',
      brandSidebar: tenant.brandSidebar ?? '#1E293B',
      isActive: tenant.isActive,
    };

    next();
  } catch (error) {
    if (error instanceof ApiError) {
      logger.warn(`Error al resolver el tenant: ${error.message}`, {
        tenantId: req.user?.tenantId,
        userId: req.user?.userId,
      });
    } else {
      logger.error(`Error inesperado al resolver el tenant: ${error instanceof Error ? error.message : String(error)}`);
    }
    next(error);
  }
};
