import { Request, Response, NextFunction } from 'express';
import * as categoryService from '../services/category.service';
import { sendSuccess, sendPaginated } from '../utils/ApiResponse';
import { AuthRequest } from '../types/express';

export const getCategories = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit } = req.query;
    const result = await categoryService.getCategories(req.user!.tenantId, req.user!.branchId, {
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    });
    sendPaginated(res, 'Categories retrieved', result.data, result.meta);
  } catch (error) {
    next(error);
  }
};

export const getCategory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const category = await categoryService.getCategoryById(req.params.id, req.user!.tenantId, req.user!.branchId);
    sendSuccess(res, 'Category retrieved', category);
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const category = await categoryService.createCategory({
      ...req.body,
      tenantId: req.user!.tenantId,
      branchId: req.user!.branchId,
    });
    sendSuccess(res, 'Category created', category, 201);
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const category = await categoryService.updateCategory(
      req.params.id,
      req.user!.tenantId,
      req.user!.branchId,
      req.body
    );
    sendSuccess(res, 'Category updated', category);
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await categoryService.deleteCategory(req.params.id, req.user!.tenantId, req.user!.branchId);
    sendSuccess(res, 'Category deleted');
  } catch (error) {
    next(error);
  }
};
