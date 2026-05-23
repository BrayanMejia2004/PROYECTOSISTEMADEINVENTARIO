import { Request, Response, NextFunction } from 'express';
import * as departmentService from './department.service';
import { sendSuccess, sendPaginated } from '../../shared/utils/apiResponse/ApiResponse';
import { AuthRequest } from '../../shared/types/express/express';

export const getDepartments = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit } = req.query;
    const result = await departmentService.getDepartments(req.user!.tenantId, req.user!.branchId, {
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    });
    sendPaginated(res, 'Departments retrieved', result.data, result.meta);
  } catch (error) {
    next(error);
  }
};

export const getDepartment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const department = await departmentService.getDepartmentById(req.params.id, req.user!.tenantId, req.user!.branchId);
    sendSuccess(res, 'Department retrieved', department);
  } catch (error) {
    next(error);
  }
};

export const createDepartment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const department = await departmentService.createDepartment({
      ...req.body,
      tenantId: req.user!.tenantId,
      branchId: req.user!.branchId,
    });
    sendSuccess(res, 'Department created', department, 201);
  } catch (error) {
    next(error);
  }
};

export const updateDepartment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const department = await departmentService.updateDepartment(
      req.params.id,
      req.user!.tenantId,
      req.user!.branchId,
      req.body
    );
    sendSuccess(res, 'Department updated', department);
  } catch (error) {
    next(error);
  }
};

export const deleteDepartment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await departmentService.deleteDepartment(req.params.id, req.user!.tenantId, req.user!.branchId);
    sendSuccess(res, 'Department deleted');
  } catch (error) {
    next(error);
  }
};
