import { Response } from 'express';
import * as supplierService from './supplier.service';
import { sendSuccess, sendPaginated } from '../../shared/utils/apiResponse/ApiResponse';
import { asyncHandler } from '../../shared/utils/asyncHandler/asyncHandler';
import { parsePagination } from '../../shared/utils/requestHelpers/requestHelpers';
import { AuthRequest } from '../../shared/types/express/express';

export const getSuppliers = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page, limit } = req.query;
  const result = await supplierService.getSuppliers(req.user!.tenantId, req.user!.branchId, parsePagination(page as string, limit as string));
  sendPaginated(res, 'Proveedores obtenidos', result.data, result.meta);
});

export const getSupplier = asyncHandler(async (req: AuthRequest, res: Response) => {
  const supplier = await supplierService.getSupplierById(req.params.id, req.user!.tenantId, req.user!.branchId);
  sendSuccess(res, 'Proveedor encontrado', supplier);
});

export const createSupplier = asyncHandler(async (req: AuthRequest, res: Response) => {
  const supplier = await supplierService.createSupplier({
    ...req.body,
    tenantId: req.user!.tenantId,
    branchId: req.user!.branchId,
  });
  sendSuccess(res, 'Proveedor creado', supplier, 201);
});

export const updateSupplier = asyncHandler(async (req: AuthRequest, res: Response) => {
  const supplier = await supplierService.updateSupplier(
    req.params.id,
    req.user!.tenantId,
    req.user!.branchId,
    req.body
  );
  sendSuccess(res, 'Proveedor actualizado', supplier);
});

export const deleteSupplier = asyncHandler(async (req: AuthRequest, res: Response) => {
  await supplierService.deleteSupplier(req.params.id, req.user!.tenantId, req.user!.branchId);
  sendSuccess(res, 'Proveedor eliminado');
});
