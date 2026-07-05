import { Response } from 'express';
import * as productService from './product.service';
import { sendSuccess, sendPaginated } from '../../shared/utils/apiResponse/ApiResponse';
import { asyncHandler } from '../../shared/utils/asyncHandler/asyncHandler';
import { parsePagination, resolveBranchId } from '../../shared/utils/requestHelpers/requestHelpers';
import { AuthRequest } from '../../shared/types/express/express';

export const getProducts = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page, limit, search, departmentId, supplierId, branchId: queryBranchId } = req.query;
  const branchId = resolveBranchId(req.user!.role, req.user!.branchId, queryBranchId as string);
  const result = await productService.getProducts({
    tenantId: req.user!.tenantId,
    branchId,
    ...parsePagination(page as string, limit as string),
    search: search as string,
    departmentId: departmentId as string,
    supplierId: supplierId as string,
  });
  sendPaginated(res, 'Productos obtenidos', result.data, result.meta);
});

export const getProductByBarcode = asyncHandler(async (req: AuthRequest, res: Response) => {
  const product = await productService.getProductByBarcode(
    req.params.barcode,
    req.user!.tenantId,
    req.user!.branchId,
  );
  if (!product) {
    sendSuccess(res, 'Producto no encontrado', null);
    return;
  }
  sendSuccess(res, 'Producto encontrado', product);
});

export const getProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
  const product = await productService.getProductById(req.params.id, req.user!.tenantId, req.user!.branchId);
  sendSuccess(res, 'Producto encontrado', product);
});

export const createProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { stock, ...productData } = req.body;
  const product = await productService.createProduct({
    ...productData,
    tenantId: req.user!.tenantId,
    branchId: req.user!.branchId,
    stock: stock !== undefined ? Number(stock) : undefined,
  });
  sendSuccess(res, 'Producto creado', product, 201);
});

export const updateProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
  const product = await productService.updateProduct(
    req.params.id,
    req.user!.tenantId,
    req.user!.branchId,
    req.body
  );
  sendSuccess(res, 'Producto actualizado', product);
});

export const deleteProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
  await productService.deleteProduct(req.params.id, req.user!.tenantId);
  sendSuccess(res, 'Producto eliminado');
});
