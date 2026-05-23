import { Request, Response, NextFunction } from 'express';
import * as brandService from './brand.service';
import { sendSuccess, sendPaginated } from '../../shared/utils/apiResponse/ApiResponse';
import { AuthRequest } from '../../shared/types/express/express';

export const getBrands = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit } = req.query;
    const result = await brandService.getBrands(req.user!.tenantId, req.user!.branchId, {
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    });
    sendPaginated(res, 'Brands retrieved', result.data, result.meta);
  } catch (error) {
    next(error);
  }
};

export const getBrand = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const brand = await brandService.getBrandById(req.params.id, req.user!.tenantId, req.user!.branchId);
    sendSuccess(res, 'Brand retrieved', brand);
  } catch (error) {
    next(error);
  }
};

export const createBrand = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const brand = await brandService.createBrand({
      ...req.body,
      tenantId: req.user!.tenantId,
      branchId: req.user!.branchId,
    });
    sendSuccess(res, 'Brand created', brand, 201);
  } catch (error) {
    next(error);
  }
};

export const updateBrand = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const brand = await brandService.updateBrand(
      req.params.id, req.user!.tenantId, req.user!.branchId, req.body
    );
    sendSuccess(res, 'Brand updated', brand);
  } catch (error) {
    next(error);
  }
};

export const deleteBrand = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await brandService.deleteBrand(req.params.id, req.user!.tenantId, req.user!.branchId);
    sendSuccess(res, 'Brand deleted');
  } catch (error) {
    next(error);
  }
};
