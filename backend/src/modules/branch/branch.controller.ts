import { Response } from 'express';
import * as branchService from './branch.service';
import { sendSuccess } from '../../shared/utils/apiResponse/ApiResponse';
import { asyncHandler } from '../../shared/utils/asyncHandler/asyncHandler';
import { AuthRequest } from '../../shared/types/express/express';

export const getBranches = asyncHandler(async (req: AuthRequest, res: Response) => {
  const branches = await branchService.getBranches(req.user!.tenantId);
  sendSuccess(res, 'Branches retrieved', branches);
});

export const getBranch = asyncHandler(async (req: AuthRequest, res: Response) => {
  const branch = await branchService.getBranchById(req.params.id, req.user!.tenantId);
  sendSuccess(res, 'Branch retrieved', branch);
});

export const createBranch = asyncHandler(async (req: AuthRequest, res: Response) => {
  const branch = await branchService.createBranch({
    ...req.body,
    tenantId: req.user!.tenantId,
  });
  sendSuccess(res, 'Branch created', branch, 201);
});

export const updateBranch = asyncHandler(async (req: AuthRequest, res: Response) => {
  const branch = await branchService.updateBranch(
    req.params.id,
    req.user!.tenantId,
    req.body
  );
  sendSuccess(res, 'Branch updated', branch);
});

export const deleteBranch = asyncHandler(async (req: AuthRequest, res: Response) => {
  await branchService.deleteBranch(req.params.id, req.user!.tenantId);
  sendSuccess(res, 'Branch deleted');
});
