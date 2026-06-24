import { Response, NextFunction } from 'express';
import * as productService from './product.service';
import cloudinary from '../../config/cloudinary/cloudinary';
import { sendSuccess, sendPaginated } from '../../shared/utils/apiResponse/ApiResponse';
import { logger } from '../../config/logger/logger';
import { AuthRequest } from '../../shared/types/express/express';

export const getProducts = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit, search, departmentId, supplierId, branchId: queryBranchId } = req.query;
    const branchId = req.user!.role === 'owner' ? (queryBranchId as string | undefined) : req.user!.branchId;
    const result = await productService.getProducts({
      tenantId: req.user!.tenantId,
      branchId,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      search: search as string,
      departmentId: departmentId as string,
      supplierId: supplierId as string,
    });
    sendPaginated(res, 'Products retrieved', result.data, result.meta);
  } catch (error) {
    logger.error(`Error en productos: ${error instanceof Error ? error.message : String(error)}`);
    next(error);
  }
};

export const getProductByBarcode = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const product = await productService.getProductByBarcode(
      req.params.barcode,
      req.user!.tenantId,
      req.user!.branchId,
    );
    if (!product) {
      sendSuccess(res, 'Product not found', null);
      return;
    }
    sendSuccess(res, 'Product retrieved', product);
  } catch (error) {
    logger.error(`Error en productos: ${error instanceof Error ? error.message : String(error)}`);
    next(error);
  }
};

export const getProduct = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const product = await productService.getProductById(req.params.id, req.user!.tenantId, req.user!.branchId);
    sendSuccess(res, 'Product retrieved', product);
  } catch (error) {
    logger.error(`Error en productos: ${error instanceof Error ? error.message : String(error)}`);
    next(error);
  }
};

export const createProduct = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { stock, ...productData } = req.body;
    const product = await productService.createProduct({
      ...productData,
      tenantId: req.user!.tenantId,
      branchId: req.user!.branchId,
      stock: stock !== undefined ? Number(stock) : undefined,
    });
    sendSuccess(res, 'Product created', product, 201);
  } catch (error) {
    logger.error(`Error en productos: ${error instanceof Error ? error.message : String(error)}`);
    next(error);
  }
};

export const updateProduct = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const product = await productService.updateProduct(
      req.params.id,
      req.user!.tenantId,
      req.user!.branchId,
      req.body
    );
    sendSuccess(res, 'Product updated', product);
  } catch (error) {
    logger.error(`Error en productos: ${error instanceof Error ? error.message : String(error)}`);
    next(error);
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await productService.deleteProduct(req.params.id, req.user!.tenantId);
    sendSuccess(res, 'Product deleted');
  } catch (error) {
    logger.error(`Error en productos: ${error instanceof Error ? error.message : String(error)}`);
    next(error);
  }
};

export const importProducts = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { products, skipDuplicates } = req.body;
    const result = await productService.importProducts(req.user!.tenantId, products, req.user!.branchId, skipDuplicates);
    sendSuccess(res, 'Import completed', result);
  } catch (error) {
    logger.error(`Error en productos: ${error instanceof Error ? error.message : String(error)}`);
    next(error);
  }
};

export const exportProducts = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const workbook = await productService.exportProducts(req.user!.tenantId);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="inventario-${Date.now()}.xlsx"`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    logger.error(`Error en productos: ${error instanceof Error ? error.message : String(error)}`);
    next(error);
  }
};

export const uploadProductImage = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return sendSuccess(res, 'No image provided', null);
    }

    const file = req.file;

    const result = await new Promise<any>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: `tenant-${req.user!.tenantId}`, resource_type: 'image' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(file.buffer);
    });

    sendSuccess(res, 'Image uploaded', { url: result.secure_url });
  } catch (error) {
    logger.error(`Error en productos: ${error instanceof Error ? error.message : String(error)}`);
    next(error);
  }
};
