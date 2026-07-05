import { Response } from 'express';
import * as departmentService from './department.service';
import { sendSuccess, sendPaginated } from '../../shared/utils/apiResponse/ApiResponse';
import { asyncHandler } from '../../shared/utils/asyncHandler/asyncHandler';
import { AuthRequest } from '../../shared/types/express/express';

export const getDepartments = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page, limit } = req.query;
  const result = await departmentService.getDepartments(req.user!.tenantId, req.user!.branchId, {
    page: page ? parseInt(page as string) : undefined,
    limit: limit ? parseInt(limit as string) : undefined,
  });
  sendPaginated(res, 'Departments retrieved', result.data, result.meta);
});

export const getDepartment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const department = await departmentService.getDepartmentById(req.params.id, req.user!.tenantId, req.user!.branchId);
  sendSuccess(res, 'Department retrieved', department);
});

export const createDepartment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const department = await departmentService.createDepartment({
    ...req.body,
    tenantId: req.user!.tenantId,
    branchId: req.user!.branchId,
  });
  sendSuccess(res, 'Department created', department, 201);
});

export const updateDepartment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const department = await departmentService.updateDepartment(
    req.params.id,
    req.user!.tenantId,
    req.user!.branchId,
    req.body
  );
  sendSuccess(res, 'Department updated', department);
});

export const deleteDepartment = asyncHandler(async (req: AuthRequest, res: Response) => {
  await departmentService.deleteDepartment(req.params.id, req.user!.tenantId, req.user!.branchId);
  sendSuccess(res, 'Department deleted');
});
