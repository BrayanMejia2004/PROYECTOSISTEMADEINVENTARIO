import mongoose from 'mongoose';
import { Sale } from '../../shared/models/sale/sale.model';
import Stock from '../../shared/models/stock/stock.model';
import Product from '../../shared/models/product/product.model';
import { ApiError } from '../../shared/utils/apiError/ApiError';

export interface SalesReportOptions {
  tenantId: string;
  branchId?: string;
  startDate: Date;
  endDate: Date;
}

export interface InventoryReportOptions {
  tenantId: string;
  branchId?: string;
}

export const getSalesReport = async (options: SalesReportOptions) => {
  const { tenantId, branchId, startDate, endDate } = options;
  const match: any = {
    tenantId: new mongoose.Types.ObjectId(tenantId),
    createdAt: { $gte: startDate, $lte: endDate },
    status: 'completed',
  };
  if (branchId) match.branchId = new mongoose.Types.ObjectId(branchId);

  const [report, totals] = await Promise.all([
    Sale.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          totalSales: { $sum: '$total' },
          count: { $sum: 1 },
          subtotal: { $sum: '$subtotal' },
          tax: { $sum: '$tax' },
          discount: { $sum: '$discount' },
        },
      },
      { $sort: { _id: 1 } },
    ]).allowDiskUse(true),
    Sale.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$total' },
          totalCount: { $sum: 1 },
        },
      },
    ]).allowDiskUse(true),
  ]);

  return {
    daily: report,
    summary: totals[0] || { totalSales: 0, totalCount: 0 },
  };
};

export const getInventoryReport = async (options: InventoryReportOptions) => {
  const { tenantId, branchId } = options;
  const match: any = { tenantId: new mongoose.Types.ObjectId(tenantId) };
  if (branchId) match.branchId = new mongoose.Types.ObjectId(branchId);

  const report = await Stock.aggregate([
    { $match: match },
    { $addFields: { productIdObj: { $toObjectId: '$productId' } } },
    {
      $lookup: {
        from: 'products',
        localField: 'productIdObj',
        foreignField: '_id',
        as: 'product',
      },
    },
    { $unwind: '$product' },
    { $addFields: { branchIdObj: { $toObjectId: '$branchId' } } },
    {
      $lookup: {
        from: 'branches',
        localField: 'branchIdObj',
        foreignField: '_id',
        as: 'branch',
      },
    },
    {
      $group: {
        _id: '$branchId',
        branchName: { $first: { $arrayElemAt: ['$branch.name', 0] } },
        totalItems: { $sum: 1 },
        totalValue: { $sum: { $multiply: ['$quantity', '$price'] } },
        totalCost: { $sum: { $multiply: ['$quantity', '$product.costPrice'] } },
        lowStock: {
          $sum: {
            $cond: [{ $lte: ['$quantity', '$product.minStock'] }, 1, 0],
          },
        },
      },
    },
  ]).allowDiskUse(true);

  return report;
};

export const getProfitabilityReport = async (
  tenantId: string,
  startDate?: Date,
  endDate?: Date,
  branchId?: string
) => {
  const match: any = {
    tenantId: new mongoose.Types.ObjectId(tenantId),
    status: 'completed',
  };
  
  if (startDate || endDate) {
    match.createdAt = {};
    if (startDate) match.createdAt.$gte = startDate;
    if (endDate) match.createdAt.$lte = endDate;
  }
  
  if (branchId) match.branchId = new mongoose.Types.ObjectId(branchId);

  const report = await Sale.aggregate([
    { $match: match },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.productId',
        productName: { $first: '$items.productName' },
        sku: { $first: '$items.sku' },
        totalSold: { $sum: '$items.quantity' },
        totalRevenue: { $sum: '$items.total' },
        totalCost: { $sum: { $multiply: ['$items.quantity', '$items.costPrice'] } },
      },
    },
    {
      $project: {
        productName: 1,
        sku: 1,
        totalSold: 1,
        totalRevenue: 1,
        totalCost: 1,
        profit: { $subtract: ['$totalRevenue', '$totalCost'] },
        margin: {
          $cond: [
            { $eq: ['$totalRevenue', 0] },
            0,
            { $multiply: [{ $divide: [{ $subtract: ['$totalRevenue', '$totalCost'] }, '$totalRevenue'] }, 100] },
          ],
        },
      },
    },
    { $sort: { profit: -1 } },
    { $limit: 100 },
  ]).allowDiskUse(true);

  return report;
};

export const getBranchComparison = async (tenantId: string, startDate: Date, endDate: Date) => {
  const report = await Sale.aggregate([
    {
      $match: {
        tenantId: new mongoose.Types.ObjectId(tenantId),
        createdAt: { $gte: startDate, $lte: endDate },
        status: 'completed',
      },
    },
    {
      $group: {
        _id: '$branchId',
        totalSales: { $sum: '$total' },
        count: { $sum: 1 },
        averageTicket: { $avg: '$total' },
      },
    },
    { $addFields: { branchIdObj: { $toObjectId: '$_id' } } },
    {
      $lookup: {
        from: 'branches',
        localField: 'branchIdObj',
        foreignField: '_id',
        as: 'branch',
      },
    },
    {
      $project: {
        _id: 1,
        totalSales: 1,
        count: 1,
        averageTicket: 1,
        branchName: { $arrayElemAt: ['$branch.name', 0] },
      },
    },
    { $sort: { totalSales: -1 } },
  ]).allowDiskUse(true);

  return report;
};

export const getHistoricalSummary = async (tenantId: string) => {
  const [result] = await Product.aggregate([
    {
      $match: {
        tenantId: new mongoose.Types.ObjectId(tenantId),
        isActive: true,
        historicalSales: { $gt: 0 },
      },
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: { $multiply: ['$historicalSales', '$price'] } },
        totalCost: { $sum: { $multiply: ['$historicalSales', '$costPrice'] } },
      },
    },
  ]).allowDiskUse(true);

  const totalRevenue = result?.totalRevenue || 0;
  const totalCost = result?.totalCost || 0;

  return {
    totalRevenue,
    totalCost,
    totalProfit: totalRevenue - totalCost,
  };
};
