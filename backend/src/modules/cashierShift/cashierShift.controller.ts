import { Response } from 'express';
import * as cashierShiftService from './cashierShift.service';
import { sendSuccess, sendPaginated } from '../../shared/utils/apiResponse/ApiResponse';
import { asyncHandler } from '../../shared/utils/asyncHandler/asyncHandler';
import { parsePagination, resolveBranchId } from '../../shared/utils/requestHelpers/requestHelpers';
import { AuthRequest } from '../../shared/types/express/express';

export const getShifts = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { branchId: queryBranchId, userId, status, startDate, endDate, page, limit } = req.query;
  const branchId = resolveBranchId(req.user!.role, req.user!.branchId, queryBranchId as string);
  const result = await cashierShiftService.getShifts(req.user!.tenantId, {
    branchId,
    userId: userId as string | undefined,
    status: status as string | undefined,
    startDate: startDate as string | undefined,
    endDate: endDate as string | undefined,
    ...parsePagination(page as string, limit as string),
  });
  sendPaginated(res, 'Turnos obtenidos', result.data, result.meta);
});

export const openShift = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { openingBalance } = req.body;
  const shift = await cashierShiftService.openShift({
    tenantId: req.user!.tenantId,
    branchId: req.user!.branchId!,
    userId: req.user!.userId,
    openingBalance,
  });
  sendSuccess(res, 'Caja abierta', shift, 201);
});

export const closeShift = asyncHandler(async (req: AuthRequest, res: Response) => {
  const shift = await cashierShiftService.closeShift({
    tenantId: req.user!.tenantId,
    branchId: req.user!.branchId!,
    shiftId: req.params.id,
  });
  sendSuccess(res, 'Caja cerrada', shift);
});

export const getCurrentShift = asyncHandler(async (req: AuthRequest, res: Response) => {
  const shift = await cashierShiftService.getCurrentShift(
    req.user!.tenantId,
    req.user!.branchId!
  );
  sendSuccess(res, 'Turno actual', shift);
});

export const getShift = asyncHandler(async (req: AuthRequest, res: Response) => {
  const shift = await cashierShiftService.getShiftById(req.params.id, req.user!.tenantId);
  sendSuccess(res, 'Turno encontrado', shift);
});

export const createMovement = asyncHandler(async (req: AuthRequest, res: Response) => {
  const movement = await cashierShiftService.createMovement({
    tenantId: req.user!.tenantId,
    branchId: req.user!.branchId!,
    shiftId: req.params.shiftId,
    userId: req.user!.userId,
    type: req.body.type,
    amount: req.body.amount,
    reason: req.body.reason,
  });
  sendSuccess(res, 'Movimiento registrado', movement, 201);
});

export const getMovements = asyncHandler(async (req: AuthRequest, res: Response) => {
  const movements = await cashierShiftService.getMovements(req.params.shiftId, req.user!.tenantId);
  sendSuccess(res, 'Movimientos obtenidos', movements);
});
