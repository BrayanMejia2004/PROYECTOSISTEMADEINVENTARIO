import { Response } from 'express';
import Branch from '../../shared/models/branch/branch.model';
import * as saleService from './sale.service';
import { generateSalePdf } from '../../shared/utils/pdf/pdf.service';
import { asyncHandler } from '../../shared/utils/asyncHandler/asyncHandler';
import { AuthRequest } from '../../shared/types/express/express';

export const getSalePdf = asyncHandler(async (req: AuthRequest, res: Response) => {
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
    branchName: branch?.name || 'Sucursal no especificada',
  });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${sale.saleNumber}.pdf"`);
  res.send(pdfBuffer);
});
