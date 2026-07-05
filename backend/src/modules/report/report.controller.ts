import { Response } from 'express';
import * as reportService from './report.service';
import { sendSuccess } from '../../shared/utils/apiResponse/ApiResponse';
import { asyncHandler } from '../../shared/utils/asyncHandler/asyncHandler';
import { ApiError } from '../../shared/utils/apiError/ApiError';
import { AuthRequest } from '../../shared/types/express/express';

export const getSalesReport = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { startDate, endDate, branchId: queryBranchId } = req.query;
  if (!startDate || !endDate) {
    throw ApiError.badRequest(
      'getSalesReport: faltan startDate o endDate',
      'Las fechas de inicio y fin son requeridas'
    );
  }
  const branchId = req.user!.role === 'owner' ? (queryBranchId as string | undefined) : req.user!.branchId;
  const report = await reportService.getSalesReport({
    tenantId: req.user!.tenantId,
    branchId,
    startDate: new Date(startDate as string),
    endDate: (() => { const d = new Date(endDate as string); d.setHours(23, 59, 59, 999); return d; })(),
  });
  sendSuccess(res, 'Sales report generated', report);
});

export const getInventoryReport = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { branchId: queryBranchId } = req.query;
  const branchId = req.user!.role === 'owner' ? (queryBranchId as string | undefined) : req.user!.branchId;
  const report = await reportService.getInventoryReport({
    tenantId: req.user!.tenantId,
    branchId,
  });
  sendSuccess(res, 'Inventory report generated', report);
});

export const getProfitabilityReport = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { startDate, endDate, branchId: queryBranchId } = req.query;
  const branchId = req.user!.role === 'owner' ? (queryBranchId as string | undefined) : req.user!.branchId;
  const report = await reportService.getProfitabilityReport(
    req.user!.tenantId,
    startDate ? new Date(startDate as string) : undefined,
    endDate ? (() => { const d = new Date(endDate as string); d.setHours(23, 59, 59, 999); return d; })() : undefined,
    branchId
  );
  sendSuccess(res, 'Profitability report generated', report);
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
    (() => { const d = new Date(endDate as string); d.setHours(23, 59, 59, 999); return d; })()
  );
  sendSuccess(res, 'Branch comparison generated', report);
});

export const getHistoricalSummary = asyncHandler(async (req: AuthRequest, res: Response) => {
  const summary = await reportService.getHistoricalSummary(req.user!.tenantId);
  sendSuccess(res, 'Historical summary', summary);
});
