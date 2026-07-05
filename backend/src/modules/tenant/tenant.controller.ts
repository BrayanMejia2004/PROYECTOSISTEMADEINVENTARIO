import { Response } from 'express';
import * as tenantService from './tenant.service';
import { sendSuccess } from '../../shared/utils/apiResponse/ApiResponse';
import { asyncHandler } from '../../shared/utils/asyncHandler/asyncHandler';
import { AuthRequest } from '../../shared/types/express/express';

export const getTenant = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenant = await tenantService.getTenantSettings(req.user!.tenantId);
  sendSuccess(res, 'Tenant settings retrieved', tenant);
});

export const updateTenant = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenant = await tenantService.updateTenantSettings(req.user!.tenantId, req.body);
  sendSuccess(res, 'Tenant settings updated', tenant);
});

export const uploadLogo = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.file) {
    sendSuccess(res, 'No image provided', null);
    return;
  }
  const tenant = await tenantService.uploadLogo(req.user!.tenantId, req.file);
  sendSuccess(res, 'Logo uploaded', tenant);
});
