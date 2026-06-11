import { Request, Response, NextFunction } from 'express';
import Branch from '../../shared/models/branch/branch.model';
import * as saleService from './sale.service';
import { generateSalePdf } from '../../shared/utils/pdf/pdf.service';
import { sendSuccess, sendPaginated } from '../../shared/utils/apiResponse/ApiResponse';
import { AuthRequest } from '../../shared/types/express/express';

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
      endDate: endDate ? (() => { const d = new Date(endDate as string); d.setHours(23, 59, 59, 999); return d; })() : undefined,
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
    const {
      startDate, endDate, status, paymentMethod, customerName, userId,
      search, minTotal, maxTotal, branchId: queryBranchId,
    } = req.query;

    const branchId = req.user!.role === 'owner'
      ? (queryBranchId as string | undefined)
      : req.user!.branchId;

    const summary = await saleService.getSalesSummary(req.user!.tenantId, {
      branchId,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? (() => { const d = new Date(endDate as string); d.setHours(23, 59, 59, 999); return d; })() : undefined,
      status: status as string | undefined,
      paymentMethod: paymentMethod as string | undefined,
      customerName: customerName as string | undefined,
      userId: userId as string | undefined,
      search: search as string | undefined,
      minTotal: minTotal ? parseFloat(minTotal as string) : undefined,
      maxTotal: maxTotal ? parseFloat(maxTotal as string) : undefined,
    });
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

export const getSaleByNumber = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const sale = await saleService.getSaleByNumber(
      req.params.saleNumber,
      req.user!.tenantId,
      req.user!.branchId
    );
    sendSuccess(res, 'Sale retrieved', sale);
  } catch (error) {
    next(error);
  }
};

export const getTransferSales = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const branchId = req.user!.role === 'owner' ? undefined : req.user!.branchId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await saleService.getTransferSales(req.user!.tenantId, branchId, page, limit);
    sendPaginated(res, 'Transfer sales retrieved', result.data, result.meta);
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

export const getSalePdf = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const [sale, branch] = await Promise.all([
      saleService.getSaleById(req.params.id, req.user!.tenantId, req.user!.branchId),
      req.user!.branchId ? Branch.findById(req.user!.branchId).select('name') : Promise.resolve(null),
    ]);

    const pdfBuffer = await generateSalePdf({
      saleNumber: sale.saleNumber,
      createdAt: new Date(sale.createdAt),
      customerName: sale.customerName,
      userName: sale.userName,
      items: sale.items,
      subtotal: sale.subtotal,
      discount: sale.discount,
      tax: sale.tax,
      total: sale.total,
      paymentMethod: sale.paymentMethod,
      transferReference: sale.transferReference,
      transferBank: sale.transferBank,
      transferAmount: sale.transferAmount,
      cardBank: sale.cardBank,
      cardReference: sale.cardReference,
      tenantName: req.tenant!.name,
      tenantNit: req.tenant!.nit,
      tenantEmail: req.tenant!.email,
      tenantPhone: req.tenant!.phone,
      tenantAddress: req.tenant!.address,
      tenantLogo: req.tenant!.logo,
      branchName: branch?.name || 'Sucursal no especificada',
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${sale.saleNumber}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};
