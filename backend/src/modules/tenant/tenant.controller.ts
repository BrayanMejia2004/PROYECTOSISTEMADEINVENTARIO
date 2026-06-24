import { Request, Response, NextFunction } from 'express';
import * as tenantService from './tenant.service';
import { sendSuccess } from '../../shared/utils/apiResponse/ApiResponse';
import { logger } from '../../config/logger/logger';
import { AuthRequest } from '../../shared/types/express/express';

export const getTenant = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const tenant = await tenantService.getTenantSettings(req.user!.tenantId);
    sendSuccess(res, 'Tenant settings retrieved', tenant);
  } catch (error) {
    logger.error(`Error en tenant: ${error instanceof Error ? error.message : String(error)}`);
    next(error);
  }
};

export const updateTenant = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const tenant = await tenantService.updateTenantSettings(req.user!.tenantId, req.body);
    sendSuccess(res, 'Tenant settings updated', tenant);
  } catch (error) {
    logger.error(`Error en tenant: ${error instanceof Error ? error.message : String(error)}`);
    next(error);
  }
};

export const uploadLogo = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return sendSuccess(res, 'No image provided', null);
    }
    const tenant = await tenantService.uploadLogo(req.user!.tenantId, req.file);
    sendSuccess(res, 'Logo uploaded', tenant);
  } catch (error) {
    logger.error(`Error en tenant: ${error instanceof Error ? error.message : String(error)}`);
    next(error);
  }
};
