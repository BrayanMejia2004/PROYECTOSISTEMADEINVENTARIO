import { Request, Response, NextFunction } from 'express';
import * as branchService from '../services/branch.service';
import { sendSuccess } from '../utils/ApiResponse';
import { AuthRequest } from '../types/express';

export const getBranches = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const branches = await branchService.getBranches(req.user!.tenantId);
    sendSuccess(res, 'Branches retrieved', branches);
  } catch (error) {
    next(error);
  }
};

export const getBranch = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const branch = await branchService.getBranchById(req.params.id, req.user!.tenantId);
    sendSuccess(res, 'Branch retrieved', branch);
  } catch (error) {
    next(error);
  }
};

export const createBranch = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const branch = await branchService.createBranch({
      ...req.body,
      tenantId: req.user!.tenantId,
    });
    sendSuccess(res, 'Branch created', branch, 201);
  } catch (error) {
    next(error);
  }
};

export const updateBranch = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const branch = await branchService.updateBranch(
      req.params.id,
      req.user!.tenantId,
      req.body
    );
    sendSuccess(res, 'Branch updated', branch);
  } catch (error) {
    next(error);
  }
};

export const deleteBranch = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await branchService.deleteBranch(req.params.id, req.user!.tenantId);
    sendSuccess(res, 'Branch deleted');
  } catch (error) {
    next(error);
  }
};
