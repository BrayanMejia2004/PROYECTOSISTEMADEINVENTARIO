import { Response } from 'express';
import * as customerService from './customer.service';
import { sendSuccess, sendPaginated } from '../../shared/utils/apiResponse/ApiResponse';
import { asyncHandler } from '../../shared/utils/asyncHandler/asyncHandler';
import { AuthRequest } from '../../shared/types/express/express';

export const getCustomers = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { search, page, limit } = req.query;
  const result = await customerService.getCustomers(req.user!.tenantId, {
    search: search as string,
    page: page ? parseInt(page as string) : undefined,
    limit: limit ? parseInt(limit as string) : undefined,
  });
  sendPaginated(res, 'Customers retrieved', result.data, result.meta);
});

export const getCustomer = asyncHandler(async (req: AuthRequest, res: Response) => {
  const customer = await customerService.getCustomerById(req.params.id, req.user!.tenantId);
  sendSuccess(res, 'Customer retrieved', customer);
});

export const createCustomer = asyncHandler(async (req: AuthRequest, res: Response) => {
  const customer = await customerService.createCustomer({
    ...req.body,
    tenantId: req.user!.tenantId,
  });
  sendSuccess(res, 'Customer created', customer, 201);
});

export const updateCustomer = asyncHandler(async (req: AuthRequest, res: Response) => {
  const customer = await customerService.updateCustomer(
    req.params.id,
    req.user!.tenantId,
    req.body
  );
  sendSuccess(res, 'Customer updated', customer);
});

export const deleteCustomer = asyncHandler(async (req: AuthRequest, res: Response) => {
  await customerService.deleteCustomer(req.params.id, req.user!.tenantId);
  sendSuccess(res, 'Customer deleted');
});
