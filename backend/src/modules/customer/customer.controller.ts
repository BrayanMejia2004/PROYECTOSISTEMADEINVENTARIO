import { Response } from 'express';
import * as customerService from './customer.service';
import { sendSuccess, sendPaginated } from '../../shared/utils/apiResponse/ApiResponse';
import { asyncHandler } from '../../shared/utils/asyncHandler/asyncHandler';
import { parsePagination } from '../../shared/utils/requestHelpers/requestHelpers';
import { AuthRequest } from '../../shared/types/express/express';

export const getCustomers = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { search, page, limit } = req.query;
  const result = await customerService.getCustomers(req.user!.tenantId, {
    search: search as string,
    ...parsePagination(page as string, limit as string),
  });
  sendPaginated(res, 'Clientes obtenidos', result.data, result.meta);
});

export const getCustomer = asyncHandler(async (req: AuthRequest, res: Response) => {
  const customer = await customerService.getCustomerById(req.params.id, req.user!.tenantId);
  sendSuccess(res, 'Cliente encontrado', customer);
});

export const createCustomer = asyncHandler(async (req: AuthRequest, res: Response) => {
  const customer = await customerService.createCustomer({
    ...req.body,
    tenantId: req.user!.tenantId,
  });
  sendSuccess(res, 'Cliente creado', customer, 201);
});

export const updateCustomer = asyncHandler(async (req: AuthRequest, res: Response) => {
  const customer = await customerService.updateCustomer(
    req.params.id,
    req.user!.tenantId,
    req.body
  );
  sendSuccess(res, 'Cliente actualizado', customer);
});

export const deleteCustomer = asyncHandler(async (req: AuthRequest, res: Response) => {
  await customerService.deleteCustomer(req.params.id, req.user!.tenantId);
  sendSuccess(res, 'Cliente eliminado');
});
