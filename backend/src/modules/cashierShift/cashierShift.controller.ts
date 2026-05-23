import { Response, NextFunction } from 'express';
import * as cashierShiftService from './cashierShift.service';
import { sendSuccess, sendPaginated } from '../../shared/utils/apiResponse/ApiResponse';
import { AuthRequest } from '../../shared/types/express/express';

export const getShifts = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { branchId: queryBranchId, userId, status, startDate, endDate, page, limit } = req.query;
    const branchId = req.user!.role === 'owner' ? (queryBranchId as string | undefined) : req.user!.branchId;
    const result = await cashierShiftService.getShifts(req.user!.tenantId, {
      branchId,
      userId: userId as string | undefined,
      status: status as string | undefined,
      startDate: startDate as string | undefined,
      endDate: endDate as string | undefined,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    });
    sendPaginated(res, 'Turnos obtenidos', result.data, result.meta);
  } catch (error) {
    next(error);
  }
};

export const openShift = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { openingBalance } = req.body;
    const shift = await cashierShiftService.openShift({
      tenantId: req.user!.tenantId,
      branchId: req.user!.branchId!,
      userId: req.user!.userId,
      openingBalance,
    });
    sendSuccess(res, 'Caja abierta', shift, 201);
  } catch (error) {
    next(error);
  }
};

export const closeShift = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const shift = await cashierShiftService.closeShift({
      tenantId: req.user!.tenantId,
      branchId: req.user!.branchId!,
      shiftId: req.params.id,
    });
    sendSuccess(res, 'Caja cerrada', shift);
  } catch (error) {
    next(error);
  }
};

export const getCurrentShift = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const shift = await cashierShiftService.getCurrentShift(
      req.user!.tenantId,
      req.user!.branchId!
    );
    sendSuccess(res, 'Turno actual', shift);
  } catch (error) {
    next(error);
  }
};

export const getShift = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const shift = await cashierShiftService.getShiftById(req.params.id, req.user!.tenantId);
    sendSuccess(res, 'Turno encontrado', shift);
  } catch (error) {
    next(error);
  }
};

export const createMovement = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
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
  } catch (error) {
    next(error);
  }
};

export const getMovements = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const movements = await cashierShiftService.getMovements(req.params.shiftId, req.user!.tenantId);
    sendSuccess(res, 'Movimientos obtenidos', movements);
  } catch (error) {
    next(error);
  }
};
