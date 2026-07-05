import { Response } from 'express';
import * as saleService from './sale.service';
import { sendSuccess, sendPaginated } from '../../shared/utils/apiResponse/ApiResponse';
import { asyncHandler } from '../../shared/utils/asyncHandler/asyncHandler';
import { parsePagination, parsePaginationOrDefault, resolveBranchId, endOfDay } from '../../shared/utils/requestHelpers/requestHelpers';
import { AuthRequest } from '../../shared/types/express/express';

export const createSale = asyncHandler(async (req: AuthRequest, res: Response) => {
  const sale = await saleService.createSale({
    ...req.body,
    tenantId: req.user!.tenantId,
    branchId: req.user!.branchId!,
    userId: req.user!.userId,
  });
  sendSuccess(res, 'Venta creada', sale, 201);
});

export const getSales = asyncHandler(async (req: AuthRequest, res: Response) => {
  const {
    startDate, endDate, page, limit,
    status, paymentMethod, customerName, userId,
    search, minTotal, maxTotal, branchId: queryBranchId,
  } = req.query;

  const branchId = resolveBranchId(req.user!.role, req.user!.branchId, queryBranchId as string);
  const result = await saleService.getSales(req.user!.tenantId, branchId, {
    startDate: startDate ? new Date(startDate as string) : undefined,
    endDate: endDate ? endOfDay(endDate as string) : undefined,
    ...parsePagination(page as string, limit as string),
    status: status as string | undefined,
    paymentMethod: paymentMethod as string | undefined,
    customerName: customerName as string | undefined,
    userId: userId as string | undefined,
    search: search as string | undefined,
    minTotal: minTotal ? parseFloat(minTotal as string) : undefined,
    maxTotal: maxTotal ? parseFloat(maxTotal as string) : undefined,
  });
  sendPaginated(res, 'Ventas obtenidas', result.data, result.meta);
});

export const getSalesSummary = asyncHandler(async (req: AuthRequest, res: Response) => {
  const {
    startDate, endDate, status, paymentMethod, customerName, userId,
    search, minTotal, maxTotal, branchId: queryBranchId,
  } = req.query;

  const branchId = resolveBranchId(req.user!.role, req.user!.branchId, queryBranchId as string);

  const summary = await saleService.getSalesSummary(req.user!.tenantId, {
    branchId,
    startDate: startDate ? new Date(startDate as string) : undefined,
    endDate: endDate ? endOfDay(endDate as string) : undefined,
    status: status as string | undefined,
    paymentMethod: paymentMethod as string | undefined,
    customerName: customerName as string | undefined,
    userId: userId as string | undefined,
    search: search as string | undefined,
    minTotal: minTotal ? parseFloat(minTotal as string) : undefined,
    maxTotal: maxTotal ? parseFloat(maxTotal as string) : undefined,
  });
  sendSuccess(res, 'Resumen de ventas obtenido', summary);
});

export const getSale = asyncHandler(async (req: AuthRequest, res: Response) => {
  const sale = await saleService.getSaleById(req.params.id, req.user!.tenantId, req.user!.branchId);
  sendSuccess(res, 'Venta encontrada', sale);
});

export const getSaleByNumber = asyncHandler(async (req: AuthRequest, res: Response) => {
  const sale = await saleService.getSaleByNumber(
    req.params.saleNumber,
    req.user!.tenantId,
    req.user!.branchId
  );
  sendSuccess(res, 'Venta encontrada', sale);
});

export const getTransferSales = asyncHandler(async (req: AuthRequest, res: Response) => {
  const branchId = req.user!.role === 'owner' ? undefined : req.user!.branchId;
  const { page, limit } = parsePaginationOrDefault(req.query.page as string, req.query.limit as string, 20);
  const result = await saleService.getTransferSales(req.user!.tenantId, branchId, page, limit);
  sendPaginated(res, 'Ventas con transferencia obtenidas', result.data, result.meta);
});

export const refundSale = asyncHandler(async (req: AuthRequest, res: Response) => {
  const sale = await saleService.refundSale(
    req.params.id,
    req.user!.tenantId,
    req.user!.branchId!
  );
  sendSuccess(res, 'Venta reembolsada', sale);
});
