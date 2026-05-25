import { Request, Response, NextFunction } from 'express';
import * as stockService from './stock.service';
import { sendSuccess, sendPaginated } from '../../shared/utils/apiResponse/ApiResponse';
import { AuthRequest } from '../../shared/types/express/express';

export const getStock = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const queryBranchId = req.query.branchId as string | undefined;
    const branchId = req.user!.role === 'owner' ? (queryBranchId || req.user!.branchId!) : req.user!.branchId!;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const result = await stockService.getStockByBranch(req.user!.tenantId, branchId, page, limit);
    sendPaginated(res, 'Stock retrieved', result.data, result.meta);
  } catch (error) {
    next(error);
  }
};

export const getLowStock = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const queryBranchId = req.query.branchId as string | undefined;
    const branchId = req.user!.role === 'owner' ? (queryBranchId || req.user!.branchId) : req.user!.branchId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const result = await stockService.getLowStockAlerts(req.user!.tenantId, branchId, page, limit);
    sendPaginated(res, 'Low stock alerts retrieved', result.data, result.meta);
  } catch (error) {
    next(error);
  }
};

export const initializeStock = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { productId, price, quantity } = req.body;
    const bodyBranchId = req.body.branchId as string | undefined;
    const branchId = req.user!.role === 'owner' ? (bodyBranchId || req.user!.branchId!) : req.user!.branchId!;
    const stock = await stockService.initializeStock(
      req.user!.tenantId,
      branchId,
      productId,
      price,
      quantity
    );
    sendSuccess(res, 'Stock initialized', stock, 201);
  } catch (error) {
    next(error);
  }
};

export const updatePrice = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { price } = req.body;
    const stock = await stockService.updateStockPrice(
      req.user!.tenantId,
      req.user!.branchId!,
      req.params.productId,
      price
    );
    sendSuccess(res, 'Price updated', stock);
  } catch (error) {
    next(error);
  }
};

export const adjustStock = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { quantity, note } = req.body;
    await stockService.adjustStock(
      req.user!.tenantId,
      req.user!.branchId!,
      req.params.productId,
      quantity,
      note
    );
    sendSuccess(res, 'Stock adjusted');
  } catch (error) {
    next(error);
  }
};

export const getOutOfStock = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const queryBranchId = req.query.branchId as string | undefined;
    const branchId = req.user!.role === 'owner' ? (queryBranchId || req.user!.branchId) : req.user!.branchId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 100;
    const result = await stockService.getOutOfStock(req.user!.tenantId, branchId, page, limit);
    sendPaginated(res, 'Out of stock products retrieved', result.data, result.meta);
  } catch (error) {
    next(error);
  }
};
