import { Response } from 'express';
import * as brandService from './brand.service';
import { sendSuccess, sendPaginated } from '../../shared/utils/apiResponse/ApiResponse';
import { asyncHandler } from '../../shared/utils/asyncHandler/asyncHandler';
import { parsePagination } from '../../shared/utils/requestHelpers/requestHelpers';
import { AuthRequest } from '../../shared/types/express/express';

export const getBrands = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page, limit } = req.query;
  const result = await brandService.getBrands(req.user!.tenantId, req.user!.branchId, parsePagination(page as string, limit as string));
  sendPaginated(res, 'Marcas obtenidas', result.data, result.meta);
});

export const getBrand = asyncHandler(async (req: AuthRequest, res: Response) => {
  const brand = await brandService.getBrandById(req.params.id, req.user!.tenantId, req.user!.branchId);
  sendSuccess(res, 'Marca encontrada', brand);
});

export const createBrand = asyncHandler(async (req: AuthRequest, res: Response) => {
  const brand = await brandService.createBrand({
    ...req.body,
    tenantId: req.user!.tenantId,
    branchId: req.user!.branchId,
  });
  sendSuccess(res, 'Marca creada', brand, 201);
});

export const updateBrand = asyncHandler(async (req: AuthRequest, res: Response) => {
  const brand = await brandService.updateBrand(
    req.params.id, req.user!.tenantId, req.user!.branchId, req.body
  );
  sendSuccess(res, 'Marca actualizada', brand);
});

export const deleteBrand = asyncHandler(async (req: AuthRequest, res: Response) => {
  await brandService.deleteBrand(req.params.id, req.user!.tenantId, req.user!.branchId);
  sendSuccess(res, 'Marca eliminada');
});
