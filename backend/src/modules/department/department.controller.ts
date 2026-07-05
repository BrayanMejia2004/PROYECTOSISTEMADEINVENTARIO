import { Response } from 'express';
import * as departmentService from './department.service';
import { sendSuccess, sendPaginated } from '../../shared/utils/apiResponse/ApiResponse';
import { asyncHandler } from '../../shared/utils/asyncHandler/asyncHandler';
import { parsePagination } from '../../shared/utils/requestHelpers/requestHelpers';
import { AuthRequest } from '../../shared/types/express/express';

export const getDepartments = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page, limit } = req.query;
  const result = await departmentService.getDepartments(req.user!.tenantId, req.user!.branchId, parsePagination(page as string, limit as string));
  sendPaginated(res, 'Departamentos obtenidos', result.data, result.meta);
});

export const getDepartment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const department = await departmentService.getDepartmentById(req.params.id, req.user!.tenantId, req.user!.branchId);
  sendSuccess(res, 'Departamento encontrado', department);
});

export const createDepartment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const department = await departmentService.createDepartment({
    ...req.body,
    tenantId: req.user!.tenantId,
    branchId: req.user!.branchId,
  });
  sendSuccess(res, 'Departamento creado', department, 201);
});

export const updateDepartment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const department = await departmentService.updateDepartment(
    req.params.id,
    req.user!.tenantId,
    req.user!.branchId,
    req.body
  );
  sendSuccess(res, 'Departamento actualizado', department);
});

export const deleteDepartment = asyncHandler(async (req: AuthRequest, res: Response) => {
  await departmentService.deleteDepartment(req.params.id, req.user!.tenantId, req.user!.branchId);
  sendSuccess(res, 'Departamento eliminado');
});
