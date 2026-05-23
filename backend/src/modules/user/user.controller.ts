import { Request, Response, NextFunction } from 'express';
import * as userService from './user.service';
import { sendSuccess, sendPaginated } from '../../shared/utils/apiResponse/ApiResponse';
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
    next(error);
  }
};

export const getUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await userService.getUserById(req.params.id, req.user!.tenantId);
    sendSuccess(res, 'User retrieved', user);
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await userService.createUser({
      ...req.body,
      tenantId: req.user!.tenantId,
    });
    sendSuccess(res, 'User created', user, 201);
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await userService.updateUser(
      req.params.id,
      req.user!.tenantId,
      req.body
    );
    sendSuccess(res, 'User updated', user);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await userService.deleteUser(req.params.id, req.user!.tenantId);
    sendSuccess(res, 'User deleted');
  } catch (error) {
    next(error);
  }
};
