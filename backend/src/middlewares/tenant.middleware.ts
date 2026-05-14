import { Request, Response, NextFunction } from 'express';
import Tenant from '../models/tenant.model';
import { ApiError } from '../utils/ApiError';
import { AuthRequest } from '../types/express';

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
      phone: tenant.phone,
      address: tenant.address,
      nit: tenant.nit,
      isActive: tenant.isActive,
    };

    next();
  } catch (error) {
    next(error);
  }
};
