import { Response } from 'express';
import * as userService from './user.service';
import { sendSuccess, sendPaginated } from '../../shared/utils/apiResponse/ApiResponse';
import { asyncHandler } from '../../shared/utils/asyncHandler/asyncHandler';
import { AuthRequest } from '../../shared/types/express/express';

export const getUsers = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { role, page, limit } = req.query;
  const result = await userService.getUsers(req.user!.tenantId, role as string, req.user!.branchId, {
    page: page ? parseInt(page as string) : undefined,
    limit: limit ? parseInt(limit as string) : undefined,
  });
  sendPaginated(res, 'Users retrieved', result.data, result.meta);
});

export const getUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await userService.getUserById(req.params.id, req.user!.tenantId);
  sendSuccess(res, 'User retrieved', user);
});

export const createUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await userService.createUser({
    ...req.body,
    tenantId: req.user!.tenantId,
  }, req.user!.userId);
  sendSuccess(res, 'User created', user, 201);
});

export const updateUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await userService.updateUser(
    req.params.id,
    req.user!.tenantId,
    req.body,
    req.user!.role,
    req.user!.userId
  );
  sendSuccess(res, 'User updated', user);
});

export const deleteUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  await userService.deleteUser(req.params.id, req.user!.tenantId, req.user!.role, req.user!.userId);
  sendSuccess(res, 'User deleted');
});
