import { Request, Response, NextFunction } from 'express';
import * as saleService from '../services/sale.service';
import { sendSuccess, sendPaginated } from '../utils/ApiResponse';
import { AuthRequest } from '../types/express';

export const createSale = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const sale = await saleService.createSale({
      ...req.body,
      tenantId: req.user!.tenantId,
      branchId: req.user!.branchId!,
      userId: req.user!.userId,
    });
    sendSuccess(res, 'Sale created', sale, 201);
  } catch (error) {
    next(error);
  }
};

export const getSales = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const {
      startDate, endDate, page, limit,
      status, paymentMethod, customerName, userId,
      search, minTotal, maxTotal, branchId: queryBranchId,
    } = req.query;

    const branchId = req.user!.role === 'owner' ? (queryBranchId as string | undefined) : req.user!.branchId;
    const result = await saleService.getSales(req.user!.tenantId, branchId, {
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      status: status as string | undefined,
      paymentMethod: paymentMethod as string | undefined,
      customerName: customerName as string | undefined,
      userId: userId as string | undefined,
      search: search as string | undefined,
      minTotal: minTotal ? parseFloat(minTotal as string) : undefined,
      maxTotal: maxTotal ? parseFloat(maxTotal as string) : undefined,
    });
    sendPaginated(res, 'Sales retrieved', result.data, result.meta);
  } catch (error) {
    next(error);
  }
};

export const getSalesSummary = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const branchId = req.user!.role === 'owner' ? undefined : req.user!.branchId;
    const summary = await saleService.getSalesSummary(req.user!.tenantId, branchId);
    sendSuccess(res, 'Sales summary retrieved', summary);
  } catch (error) {
    next(error);
  }
};

export const getSale = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const sale = await saleService.getSaleById(req.params.id, req.user!.tenantId, req.user!.branchId);
    sendSuccess(res, 'Sale retrieved', sale);
  } catch (error) {
    next(error);
  }
};

export const refundSale = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const sale = await saleService.refundSale(
      req.params.id,
      req.user!.tenantId,
      req.user!.branchId!
    );
    sendSuccess(res, 'Sale refunded', sale);
  } catch (error) {
    next(error);
  }
};
