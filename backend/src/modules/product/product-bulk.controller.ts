import { Response } from 'express';
import * as productService from './product.service';
import { sendSuccess } from '../../shared/utils/apiResponse/ApiResponse';
import { asyncHandler } from '../../shared/utils/asyncHandler/asyncHandler';
import { AuthRequest } from '../../shared/types/express/express';

export const importProducts = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { products, skipDuplicates } = req.body;
  const result = await productService.importProducts(req.user!.tenantId, products, req.user!.branchId, skipDuplicates);
  sendSuccess(res, 'Importación completada', result);
});

export const exportProducts = asyncHandler(async (req: AuthRequest, res: Response) => {
  const workbook = await productService.exportProducts(req.user!.tenantId);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="inventario-${Date.now()}.xlsx"`);
  await workbook.xlsx.write(res);
  res.end();
});
