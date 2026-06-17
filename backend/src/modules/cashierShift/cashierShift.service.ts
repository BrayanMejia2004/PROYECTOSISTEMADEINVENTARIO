import mongoose from 'mongoose';
import CashierShift from '../../shared/models/cashierShift/cashierShift.model';
import CashMovement from '../../shared/models/cashMovement/cashMovement.model';
import { ApiError } from '../../shared/utils/apiError/ApiError';
import * as saleService from '../sale/sale.service';
import { shiftStateMachine } from './shiftStateMachine';
import type { ShiftMovementAggregation, ShiftFilter } from '../../shared/types/queries';

interface OpenShiftInput {
  tenantId: string;
  branchId: string;
  userId: string;
  openingBalance: number;
}

interface CloseShiftInput {
  tenantId: string;
  branchId: string;
  shiftId: string;
}

interface GetShiftsFilters {
  branchId?: string;
  userId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

interface CreateMovementInput {
  tenantId: string;
  branchId: string;
  shiftId: string;
  userId: string;
  type: 'entry' | 'exit';
  amount: number;
  reason: string;
}

const getMovementTotals = async (tenantId: string, branchId: string, shiftId: string) => {
  const movements = await CashMovement.aggregate<ShiftMovementAggregation>([
    {
      $match: {
        tenantId: new mongoose.Types.ObjectId(tenantId),
        branchId: new mongoose.Types.ObjectId(branchId),
        shiftId: new mongoose.Types.ObjectId(shiftId),
      },
    },
    { $group: { _id: '$type', total: { $sum: '$amount' } } },
  ]);
  const totalEntries = movements.find((m) => m._id === 'entry')?.total || 0;
  const totalExits = movements.find((m) => m._id === 'exit')?.total || 0;
  return { totalEntries, totalExits };
};

const buildShiftFilter = (tenantId: string, filters: GetShiftsFilters): ShiftFilter => {
  const { branchId, userId, status, startDate, endDate } = filters;
  const match: ShiftFilter = { tenantId: new mongoose.Types.ObjectId(tenantId) };
  if (branchId) match.branchId = new mongoose.Types.ObjectId(branchId);
  if (userId) match.userId = new mongoose.Types.ObjectId(userId);
  if (status) match.status = status;
  if (startDate || endDate) {
    match.openedAt = {};
    if (startDate) match.openedAt.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      match.openedAt.$lte = end;
    }
  }
  return match;
};

const buildShiftAggregationPipeline = (match: ShiftFilter, page: number, limit: number): any[] => [
  { $match: match },
  { $sort: { openedAt: -1 } },
  { $skip: (page - 1) * limit },
  { $limit: limit },
  {
    $lookup: {
      from: 'users',
      let: { userIdStr: '$userId' },
      pipeline: [
        { $match: { $expr: { $eq: ['$_id', { $toObjectId: '$$userIdStr' }] } } },
        { $project: { firstName: 1, lastName: 1, _id: 0 } },
      ],
      as: 'user',
    },
  },
  { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
  {
    $lookup: {
      from: 'branches',
      let: { branchIdStr: '$branchId' },
      pipeline: [
        { $match: { $expr: { $eq: ['$_id', { $toObjectId: '$$branchIdStr' }] } } },
        { $project: { name: 1, _id: 0 } },
      ],
      as: 'branch',
    },
  },
  { $unwind: { path: '$branch', preserveNullAndEmptyArrays: true } },
  {
    $project: {
      _id: 1, tenantId: 1, branchId: 1, userId: 1,
      openingBalance: 1, closingBalance: 1, totalSales: 1,
      totalCash: 1, totalCard: 1, totalTransfer: 1, totalProfit: 1,
      totalEntries: 1, totalExits: 1, status: 1, openedAt: 1, closedAt: 1, createdAt: 1,
      userName: { $cond: ['$user', { $concat: ['$user.firstName', ' ', '$user.lastName'] }, null] },
      branchName: { $cond: ['$branch', '$branch.name', null] },
    },
  },
];

const applyShiftClosure = (shift: any, summary: any, totalEntries: number, totalExits: number) => {
  shift.totalSales = summary.totalRevenue;
  shift.totalCash = summary.cashTotal;
  shift.totalCard = summary.cardTotal;
  shift.totalTransfer = summary.transferTotal;
  shift.totalProfit = summary.totalProfit;
  shift.totalEntries = totalEntries;
  shift.totalExits = totalExits;
  shift.closingBalance = shift.openingBalance + summary.totalRevenue + totalEntries - totalExits;
  shift.closedAt = new Date();
  shift.status = 'closed';
};

export const openShift = async (input: OpenShiftInput) => {
  const existing = await CashierShift.findOne({
    tenantId: input.tenantId,
    branchId: input.branchId,
    status: 'open',
  });

  if (existing) {
    throw ApiError.conflict('Ya hay una caja abierta en esta sucursal');
  }

  const shift = new CashierShift({
    tenantId: input.tenantId,
    branchId: input.branchId,
    userId: input.userId,
    openingBalance: input.openingBalance,
    totalSales: 0,
    totalCash: 0,
    totalCard: 0,
    totalTransfer: 0,
    totalProfit: 0,
    totalEntries: 0,
    totalExits: 0,
    status: 'open',
    openedAt: new Date(),
  });

  await shift.save();
  return shift;
};

export const closeShift = async (input: CloseShiftInput) => {
  const shift = await CashierShift.findOne({
    _id: input.shiftId, tenantId: input.tenantId, branchId: input.branchId,
  });
  if (!shift) throw ApiError.notFound('Caja no encontrada');

  shiftStateMachine.transition(shift.status as 'open' | 'closed', 'closed');

  const summary = await saleService.getSalesSummary(input.tenantId, { branchId: input.branchId });
  const { totalEntries, totalExits } = await getMovementTotals(input.tenantId, input.branchId, input.shiftId);

  applyShiftClosure(shift, summary, totalEntries, totalExits);
  await shift.save();
  return shift;
};

export const getCurrentShift = async (tenantId: string, branchId: string) => {
  const shift = await CashierShift.findOne({ tenantId, branchId, status: 'open' });
  if (!shift) return null;

  const summary = await saleService.getSalesSummary(tenantId, { branchId });
  const { totalEntries, totalExits } = await getMovementTotals(tenantId, branchId, shift._id.toString());

  return {
    ...shift.toObject(),
    currentTotal: shift.openingBalance + summary.cashTotal + totalEntries - totalExits,
    summary,
    totalEntries,
    totalExits,
  };
};

export const getShiftById = async (shiftId: string, tenantId: string) => {
  const shift = await CashierShift.findOne({ _id: shiftId, tenantId });
  if (!shift) throw ApiError.notFound('Caja no encontrada');
  return shift;
};

export const createMovement = async (input: CreateMovementInput) => {
  const shift = await CashierShift.findOne({
    _id: input.shiftId,
    tenantId: input.tenantId,
    branchId: input.branchId,
  });

  if (!shift) {
    throw ApiError.notFound('Turno de caja no encontrado');
  }

  if (!shiftStateMachine.canRegisterMovement(shift.status as 'open' | 'closed')) {
    throw ApiError.badRequest('No se pueden registrar movimientos en un turno cerrado');
  }

  const movement = new CashMovement({
    tenantId: input.tenantId,
    branchId: input.branchId,
    shiftId: input.shiftId,
    userId: input.userId,
    type: input.type,
    amount: input.amount,
    reason: input.reason,
  });

  await movement.save();
  return movement;
};

export const getMovements = async (shiftId: string, tenantId: string) => {
  const movements = await CashMovement.aggregate([
    { $match: { shiftId: new mongoose.Types.ObjectId(shiftId), tenantId: new mongoose.Types.ObjectId(tenantId) } },
    { $sort: { createdAt: -1 } },
    {
      $lookup: {
        from: 'users',
        let: { userIdStr: '$userId' },
        pipeline: [
          { $match: { $expr: { $eq: ['$_id', { $toObjectId: '$$userIdStr' }] } } },
          { $project: { firstName: 1, lastName: 1, _id: 0 } },
        ],
        as: 'user',
      },
    },
    { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 1,
        type: 1,
        amount: 1,
        reason: 1,
        createdAt: 1,
        userName: { $cond: ['$user', { $concat: ['$user.firstName', ' ', '$user.lastName'] }, null] },
      },
    },
  ]);
  return movements;
};

interface PaginatedResult<T> {
  data: T[];
  meta: { total: number; page: number; limit: number };
}

export const getShifts = async (tenantId: string, filters: GetShiftsFilters): Promise<PaginatedResult<any>> => {
  const { page = 1, limit = 20 } = filters;
  const match = buildShiftFilter(tenantId, filters);
  const total = await CashierShift.countDocuments(match);
  const pipeline = buildShiftAggregationPipeline(match, page, limit);
  const shifts = await CashierShift.aggregate(pipeline).allowDiskUse(true);
  return { data: shifts, meta: { total, page, limit } };
};
