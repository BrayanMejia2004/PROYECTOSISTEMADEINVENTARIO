import { NextFunction, Response } from 'express';
import * as customerService from './customer.service';
import { sendSuccess, sendPaginated } from '../../shared/utils/apiResponse/ApiResponse';
import { logger } from '../../config/logger/logger';
import { AuthRequest } from '../../shared/types/express/express';

export const getCustomers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { search, page, limit } = req.query;
    const result = await customerService.getCustomers(req.user!.tenantId, {
      search: search as string,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    });
    sendPaginated(res, 'Customers retrieved', result.data, result.meta);
  } catch (error) {
    logger.error(`Error en clientes: ${error instanceof Error ? error.message : String(error)}`);
    next(error);
  }
};

export const getCustomer = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const customer = await customerService.getCustomerById(req.params.id, req.user!.tenantId);
    sendSuccess(res, 'Customer retrieved', customer);
  } catch (error) {
    logger.error(`Error en clientes: ${error instanceof Error ? error.message : String(error)}`);
    next(error);
  }
};

export const createCustomer = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const customer = await customerService.createCustomer({
      ...req.body,
      tenantId: req.user!.tenantId,
    });
    sendSuccess(res, 'Customer created', customer, 201);
  } catch (error) {
    logger.error(`Error en clientes: ${error instanceof Error ? error.message : String(error)}`);
    next(error);
  }
};

export const updateCustomer = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const customer = await customerService.updateCustomer(
      req.params.id,
      req.user!.tenantId,
      req.body
    );
    sendSuccess(res, 'Customer updated', customer);
  } catch (error) {
    logger.error(`Error en clientes: ${error instanceof Error ? error.message : String(error)}`);
    next(error);
  }
};

export const deleteCustomer = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await customerService.deleteCustomer(req.params.id, req.user!.tenantId);
    sendSuccess(res, 'Customer deleted');
  } catch (error) {
    logger.error(`Error en clientes: ${error instanceof Error ? error.message : String(error)}`);
    next(error);
  }
};
