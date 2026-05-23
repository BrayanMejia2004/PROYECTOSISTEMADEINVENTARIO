import { Request, Response, NextFunction } from 'express';
import * as supplierService from './supplier.service';
import { sendSuccess, sendPaginated } from '../../shared/utils/apiResponse/ApiResponse';
import { AuthRequest } from '../../shared/types/express/express';

export const getSuppliers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit } = req.query;
    const result = await supplierService.getSuppliers(req.user!.tenantId, req.user!.branchId, {
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    });
    sendPaginated(res, 'Suppliers retrieved', result.data, result.meta);
  } catch (error) {
    next(error);
  }
};

export const getSupplier = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const supplier = await supplierService.getSupplierById(req.params.id, req.user!.tenantId, req.user!.branchId);
    sendSuccess(res, 'Supplier retrieved', supplier);
  } catch (error) {
    next(error);
  }
};

export const createSupplier = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const supplier = await supplierService.createSupplier({
      ...req.body,
      tenantId: req.user!.tenantId,
      branchId: req.user!.branchId,
    });
    sendSuccess(res, 'Supplier created', supplier, 201);
  } catch (error) {
    next(error);
  }
};

export const updateSupplier = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const supplier = await supplierService.updateSupplier(
      req.params.id,
      req.user!.tenantId,
      req.user!.branchId,
      req.body
    );
    sendSuccess(res, 'Supplier updated', supplier);
  } catch (error) {
    next(error);
  }
};

export const deleteSupplier = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await supplierService.deleteSupplier(req.params.id, req.user!.tenantId, req.user!.branchId);
    sendSuccess(res, 'Supplier deleted');
  } catch (error) {
    next(error);
  }
};
