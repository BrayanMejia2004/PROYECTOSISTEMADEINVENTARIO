import { Request, Response, NextFunction } from 'express';
import Tenant from '../../shared/models/tenant/tenant.model';
import { ApiError } from '../../shared/utils/apiError/ApiError';
import { AuthRequest } from '../../shared/types/express/express';

export const resolveTenant = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.tenantId) {
      throw ApiError.unauthorized('Tenant ID missing');
    }

    const tenant = await Tenant.findById(req.user.tenantId);
    if (!tenant) {
      throw ApiError.notFound('Tenant not found');
    }
    if (!tenant.isActive) {
      throw ApiError.forbidden('Tenant inactive');
    }

    req.tenant = {
      _id: tenant._id.toString(),
      slug: tenant.slug,
      name: tenant.name,
      email: tenant.email,
      phone: tenant.phone ?? undefined,
      address: tenant.address ?? undefined,
      nit: tenant.nit ?? undefined,
      isActive: tenant.isActive,
    };

    next();
  } catch (error) {
    next(error);
  }
};
