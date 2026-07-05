import { Response } from 'express';
import * as stockService from './stock.service';
import { sendSuccess, sendPaginated } from '../../shared/utils/apiResponse/ApiResponse';
import { asyncHandler } from '../../shared/utils/asyncHandler/asyncHandler';
import { AuthRequest } from '../../shared/types/express/express';

export const getStock = asyncHandler(async (req: AuthRequest, res: Response) => {
  const queryBranchId = req.query.branchId as string | undefined;
  const branchId = req.user!.role === 'owner' ? (queryBranchId || req.user!.branchId!) : req.user!.branchId!;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50;
  const result = await stockService.getStockByBranch(req.user!.tenantId, branchId, page, limit);
  sendPaginated(res, 'Stock retrieved', result.data, result.meta);
});

export const getLowStock = asyncHandler(async (req: AuthRequest, res: Response) => {
  const queryBranchId = req.query.branchId as string | undefined;
  const branchId = req.user!.role === 'owner' ? (queryBranchId || req.user!.branchId) : req.user!.branchId;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50;
  const result = await stockService.getLowStockAlerts(req.user!.tenantId, branchId, page, limit);
  sendPaginated(res, 'Low stock alerts retrieved', result.data, result.meta);
});

export const initializeStock = asyncHandler(async (req: AuthRequest, res: Response) => {
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
});

export const updatePrice = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { price } = req.body;
  const stock = await stockService.updateStockPrice(
    req.user!.tenantId,
    req.user!.branchId!,
    req.params.productId,
    price
  );
  sendSuccess(res, 'Price updated', stock);
});

export const adjustStock = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { quantity, note } = req.body;
  await stockService.adjustStock(
    req.user!.tenantId,
    req.user!.branchId!,
    req.params.productId,
    quantity,
    note
  );
  sendSuccess(res, 'Stock adjusted');
});

export const getOutOfStock = asyncHandler(async (req: AuthRequest, res: Response) => {
  const queryBranchId = req.query.branchId as string | undefined;
  const branchId = req.user!.role === 'owner' ? (queryBranchId || req.user!.branchId) : req.user!.branchId;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 100;
  const result = await stockService.getOutOfStock(req.user!.tenantId, branchId, page, limit);
  sendPaginated(res, 'Out of stock products retrieved', result.data, result.meta);
});
