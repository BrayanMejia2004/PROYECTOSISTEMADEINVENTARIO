import { Response } from 'express';
import * as reportService from './report.service';
import { sendSuccess } from '../../shared/utils/apiResponse/ApiResponse';
import { asyncHandler } from '../../shared/utils/asyncHandler/asyncHandler';
import { ApiError } from '../../shared/utils/apiError/ApiError';
import { resolveBranchId, endOfDay } from '../../shared/utils/requestHelpers/requestHelpers';
import { AuthRequest } from '../../shared/types/express/express';

export const getSalesReport = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { startDate, endDate, branchId: queryBranchId } = req.query;
  if (!startDate || !endDate) {
    throw ApiError.badRequest(
      'getSalesReport: faltan startDate o endDate',
      'Las fechas de inicio y fin son requeridas'
    );
  }
  const branchId = resolveBranchId(req.user!.role, req.user!.branchId, queryBranchId as string);
  const report = await reportService.getSalesReport({
    tenantId: req.user!.tenantId,
    branchId,
    startDate: new Date(startDate as string),
    endDate: endOfDay(endDate as string),
  });
  sendSuccess(res, 'Reporte de ventas generado', report);
});

export const getInventoryReport = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { branchId: queryBranchId } = req.query;
  const branchId = resolveBranchId(req.user!.role, req.user!.branchId, queryBranchId as string);
  const report = await reportService.getInventoryReport({
    tenantId: req.user!.tenantId,
    branchId,
  });
  sendSuccess(res, 'Reporte de inventario generado', report);
});

export const getProfitabilityReport = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { startDate, endDate, branchId: queryBranchId } = req.query;
  const branchId = resolveBranchId(req.user!.role, req.user!.branchId, queryBranchId as string);
  const report = await reportService.getProfitabilityReport(
    req.user!.tenantId,
    startDate ? new Date(startDate as string) : undefined,
    endDate ? endOfDay(endDate as string) : undefined,
    branchId
  );
  sendSuccess(res, 'Reporte de rentabilidad generado', report);
});

export const getBranchComparison = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { startDate, endDate } = req.query;
  if (!startDate || !endDate) {
    throw ApiError.badRequest(
      'getBranchComparison: faltan startDate o endDate',
      'Las fechas de inicio y fin son requeridas'
    );
  }
  const report = await reportService.getBranchComparison(
    req.user!.tenantId,
    new Date(startDate as string),
    endOfDay(endDate as string)
  );
  sendSuccess(res, 'Comparación de sucursales generada', report);
});

export const getHistoricalSummary = asyncHandler(async (req: AuthRequest, res: Response) => {
  const summary = await reportService.getHistoricalSummary(req.user!.tenantId);
  sendSuccess(res, 'Resumen histórico', summary);
});
