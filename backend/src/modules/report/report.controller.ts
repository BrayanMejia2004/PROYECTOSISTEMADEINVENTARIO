import { Request, Response, NextFunction } from 'express';
import * as reportService from './report.service';
import { sendSuccess } from '../../shared/utils/apiResponse/ApiResponse';
import { AuthRequest } from '../../shared/types/express/express';

export const getSalesReport = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate, branchId: queryBranchId } = req.query;
    if (!startDate || !endDate) {
      throw new Error('startDate and endDate are required');
    }
    const branchId = req.user!.role === 'owner' ? (queryBranchId as string | undefined) : req.user!.branchId;
    const report = await reportService.getSalesReport({
      tenantId: req.user!.tenantId,
      branchId,
      startDate: new Date(startDate as string),
      endDate: (() => { const d = new Date(endDate as string); d.setHours(23, 59, 59, 999); return d; })(),
    });
    sendSuccess(res, 'Sales report generated', report);
  } catch (error) {
    next(error);
  }
};

export const getInventoryReport = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { branchId: queryBranchId } = req.query;
    const branchId = req.user!.role === 'owner' ? (queryBranchId as string | undefined) : req.user!.branchId;
    const report = await reportService.getInventoryReport({
      tenantId: req.user!.tenantId,
      branchId,
    });
    sendSuccess(res, 'Inventory report generated', report);
  } catch (error) {
    next(error);
  }
};

export const getProfitabilityReport = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate, branchId: queryBranchId } = req.query;
    const branchId = req.user!.role === 'owner' ? (queryBranchId as string | undefined) : req.user!.branchId;
    const report = await reportService.getProfitabilityReport(
      req.user!.tenantId,
      startDate ? new Date(startDate as string) : undefined,
      endDate ? (() => { const d = new Date(endDate as string); d.setHours(23, 59, 59, 999); return d; })() : undefined,
      branchId
    );
    sendSuccess(res, 'Profitability report generated', report);
  } catch (error) {
    next(error);
  }
};

export const getBranchComparison = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      throw new Error('startDate and endDate are required');
    }
    const report = await reportService.getBranchComparison(
      req.user!.tenantId,
      new Date(startDate as string),
      (() => { const d = new Date(endDate as string); d.setHours(23, 59, 59, 999); return d; })()
    );
    sendSuccess(res, 'Branch comparison generated', report);
  } catch (error) {
    next(error);
  }
};

export const getHistoricalSummary = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const summary = await reportService.getHistoricalSummary(req.user!.tenantId);
    sendSuccess(res, 'Historical summary', summary);
  } catch (error) {
    next(error);
  }
};
