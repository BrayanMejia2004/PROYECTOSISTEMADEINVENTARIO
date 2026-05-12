import { Request, Response, NextFunction } from 'express';
import * as stockService from '../services/stock.service';
import { sendSuccess } from '../utils/ApiResponse';
import { AuthRequest } from '../types/express';

export const getStock = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const branchId = req.query.branchId as string || req.user!.branchId!;
    const stock = await stockService.getStockByBranch(req.user!.tenantId, branchId);
    sendSuccess(res, 'Stock retrieved', stock);
  } catch (error) {
    next(error);
  }
};

export const getLowStock = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const branchId = req.query.branchId as string || req.user!.branchId;
    const alerts = await stockService.getLowStockAlerts(req.user!.tenantId, branchId);
    sendSuccess(res, 'Low stock alerts retrieved', alerts);
  } catch (error) {
    next(error);
  }
};

export const initializeStock = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { productId, price, quantity, branchId } = req.body;
    const stock = await stockService.initializeStock(
      req.user!.tenantId,
      branchId || req.user!.branchId!,
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
