import { Response } from 'express';
import * as userService from './user.service';
import { sendSuccess, sendPaginated } from '../../shared/utils/apiResponse/ApiResponse';
import { asyncHandler } from '../../shared/utils/asyncHandler/asyncHandler';
import { parsePagination } from '../../shared/utils/requestHelpers/requestHelpers';
import { AuthRequest } from '../../shared/types/express/express';

export const getUsers = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { role, page, limit } = req.query;
  const result = await userService.getUsers(req.user!.tenantId, role as string, req.user!.branchId, parsePagination(page as string, limit as string));
  sendPaginated(res, 'Usuarios obtenidos', result.data, result.meta);
});

export const getUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await userService.getUserById(req.params.id, req.user!.tenantId);
  sendSuccess(res, 'Usuario encontrado', user);
});

export const createUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await userService.createUser({
    ...req.body,
    tenantId: req.user!.tenantId,
  }, req.user!.userId);
  sendSuccess(res, 'Usuario creado', user, 201);
});

export const updateUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await userService.updateUser(
    req.params.id,
    req.user!.tenantId,
    req.body,
    req.user!.role,
    req.user!.userId
  );
  sendSuccess(res, 'Usuario actualizado', user);
});

export const deleteUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  await userService.deleteUser(req.params.id, req.user!.tenantId, req.user!.role, req.user!.userId);
  sendSuccess(res, 'Usuario eliminado');
});
