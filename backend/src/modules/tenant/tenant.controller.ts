import { Request, Response, NextFunction } from 'express';
import * as tenantService from './tenant.service';
import { sendSuccess } from '../../shared/utils/apiResponse/ApiResponse';
import { AuthRequest } from '../../shared/types/express/express';

export const getTenant = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const tenant = await tenantService.getTenantSettings(req.user!.tenantId);
    sendSuccess(res, 'Tenant settings retrieved', tenant);
  } catch (error) {
    next(error);
  }
};

export const updateTenant = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const tenant = await tenantService.updateTenantSettings(req.user!.tenantId, req.body);
    sendSuccess(res, 'Tenant settings updated', tenant);
  } catch (error) {
    next(error);
  }
};
