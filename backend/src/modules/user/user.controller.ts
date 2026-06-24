import { Response, NextFunction } from 'express';
import * as userService from './user.service';
import { sendSuccess, sendPaginated } from '../../shared/utils/apiResponse/ApiResponse';
import { logger } from '../../config/logger/logger';
import { AuthRequest } from '../../shared/types/express/express';

export const getUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { role, page, limit } = req.query;
    const result = await userService.getUsers(req.user!.tenantId, role as string, req.user!.branchId, {
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    });
    sendPaginated(res, 'Users retrieved', result.data, result.meta);
  } catch (error) {
    logger.error(`Error en usuarios: ${error instanceof Error ? error.message : String(error)}`);
    next(error);
  }
};

export const getUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await userService.getUserById(req.params.id, req.user!.tenantId);
    sendSuccess(res, 'User retrieved', user);
  } catch (error) {
    logger.error(`Error en usuarios: ${error instanceof Error ? error.message : String(error)}`);
    next(error);
  }
};

export const createUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await userService.createUser({
      ...req.body,
      tenantId: req.user!.tenantId,
    }, req.user!.userId);
    sendSuccess(res, 'User created', user, 201);
  } catch (error) {
    logger.error(`Error en usuarios: ${error instanceof Error ? error.message : String(error)}`);
    next(error);
  }
};

export const updateUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await userService.updateUser(
      req.params.id,
      req.user!.tenantId,
      req.body,
      req.user!.role,
      req.user!.userId
    );
    sendSuccess(res, 'User updated', user);
  } catch (error) {
    logger.error(`Error en usuarios: ${error instanceof Error ? error.message : String(error)}`);
    next(error);
  }
};

export const deleteUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await userService.deleteUser(req.params.id, req.user!.tenantId, req.user!.role, req.user!.userId);
    sendSuccess(res, 'User deleted');
  } catch (error) {
    logger.error(`Error en usuarios: ${error instanceof Error ? error.message : String(error)}`);
    next(error);
  }
};
