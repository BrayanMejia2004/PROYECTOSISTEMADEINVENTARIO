import { Response } from 'express';
import * as stockService from './stock.service';
import { sendSuccess, sendPaginated } from '../../shared/utils/apiResponse/ApiResponse';
import { asyncHandler } from '../../shared/utils/asyncHandler/asyncHandler';
import { parsePaginationOrDefault, resolveBranchId } from '../../shared/utils/requestHelpers/requestHelpers';
import { AuthRequest } from '../../shared/types/express/express';

export const getStock = asyncHandler(async (req: AuthRequest, res: Response) => {
  const branchId = resolveBranchId(req.user!.role, req.user!.branchId, req.query.branchId as string)!;
  const { page, limit } = parsePaginationOrDefault(req.query.page as string, req.query.limit as string, 50);
  const result = await stockService.getStockByBranch(req.user!.tenantId, branchId, page, limit);
  sendPaginated(res, 'Inventario obtenido', result.data, result.meta);
});

export const getLowStock = asyncHandler(async (req: AuthRequest, res: Response) => {
  const branchId = resolveBranchId(req.user!.role, req.user!.branchId, req.query.branchId as string);
  const { page, limit } = parsePaginationOrDefault(req.query.page as string, req.query.limit as string, 50);
  const result = await stockService.getLowStockAlerts(req.user!.tenantId, branchId, page, limit);
  sendPaginated(res, 'Alertas de stock bajo obtenidas', result.data, result.meta);
});

export const initializeStock = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { productId, price, quantity } = req.body;
  const branchId = resolveBranchId(req.user!.role, req.user!.branchId, req.body.branchId as string)!;
  const stock = await stockService.initializeStock({
    tenantId: req.user!.tenantId,
    branchId,
    productId,
    price,
    quantity,
  });
  sendSuccess(res, 'Stock inicializado', stock, 201);
});

export const updatePrice = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { price } = req.body;
  const stock = await stockService.updateStockPrice({
    tenantId: req.user!.tenantId,
    branchId: req.user!.branchId!,
    productId: req.params.productId,
    price,
  });
  sendSuccess(res, 'Precio actualizado', stock);
});

export const adjustStock = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { quantity, note } = req.body;
  await stockService.adjustStock({
    tenantId: req.user!.tenantId,
    branchId: req.user!.branchId!,
    productId: req.params.productId,
    quantity,
    note,
  });
  sendSuccess(res, 'Stock ajustado');
});

export const getOutOfStock = asyncHandler(async (req: AuthRequest, res: Response) => {
  const branchId = resolveBranchId(req.user!.role, req.user!.branchId, req.query.branchId as string);
  const { page, limit } = parsePaginationOrDefault(req.query.page as string, req.query.limit as string, 100);
  const result = await stockService.getOutOfStock(req.user!.tenantId, branchId, page, limit);
  sendPaginated(res, 'Productos agotados obtenidos', result.data, result.meta);
});
