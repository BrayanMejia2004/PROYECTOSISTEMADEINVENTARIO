import mongoose from 'mongoose';
import { Sale } from '../../shared/models/sale/sale.model';
import Stock from '../../shared/models/stock/stock.model';
import Product from '../../shared/models/product/product.model';
import type {
  DailySalesAggregation,
  SalesTotalsAggregation,
  BranchInventoryAggregation,
  ProductProfitAggregation,
  BranchComparisonAggregation,
  HistoricalSummaryAggregation,
} from '../../shared/types/queries';

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

interface ReportStrategy<TInput = any, TOutput = any> {
  readonly name: string;
  generate(input: TInput): Promise<TOutput>;
}

class SalesReportStrategy implements ReportStrategy<SalesReportOptions> {
  readonly name = 'sales';

  async generate(options: SalesReportOptions) {
    const { tenantId, branchId, startDate, endDate } = options;
    const match: Record<string, any> = {
      tenantId: new mongoose.Types.ObjectId(tenantId),
      createdAt: { $gte: startDate, $lte: endDate },
      status: 'completed',
    };
    if (branchId) match.branchId = new mongoose.Types.ObjectId(branchId);

    const [report, totals] = await Promise.all([
      Sale.aggregate<DailySalesAggregation>([
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
      Sale.aggregate<SalesTotalsAggregation>([
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
  }
}

class InventoryReportStrategy implements ReportStrategy<InventoryReportOptions> {
  readonly name = 'inventory';

  async generate(options: InventoryReportOptions) {
    const { tenantId, branchId } = options;
    const match: Record<string, any> = { tenantId: new mongoose.Types.ObjectId(tenantId) };
    if (branchId) match.branchId = new mongoose.Types.ObjectId(branchId);

    const report = await Stock.aggregate<BranchInventoryAggregation>([
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
  }
}

interface ProfitabilityOptions {
  tenantId: string;
  startDate?: Date;
  endDate?: Date;
  branchId?: string;
}

class ProfitabilityReportStrategy implements ReportStrategy<ProfitabilityOptions> {
  readonly name = 'profitability';

  async generate(options: ProfitabilityOptions) {
    const { tenantId, startDate, endDate, branchId } = options;
    const match: Record<string, any> = {
      tenantId: new mongoose.Types.ObjectId(tenantId),
      status: 'completed',
    };

    if (startDate || endDate) {
      match.createdAt = {};
      if (startDate) match.createdAt.$gte = startDate;
      if (endDate) match.createdAt.$lte = endDate;
    }

    if (branchId) match.branchId = new mongoose.Types.ObjectId(branchId);

    const report = await Sale.aggregate<ProductProfitAggregation>([
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
  }
}

interface BranchComparisonOptions {
  tenantId: string;
  startDate: Date;
  endDate: Date;
}

class BranchComparisonStrategy implements ReportStrategy<BranchComparisonOptions> {
  readonly name = 'branches';

  async generate(options: BranchComparisonOptions) {
    const { tenantId, startDate, endDate } = options;
    const report = await Sale.aggregate<BranchComparisonAggregation>([
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
  }
}

class HistoricalSummaryStrategy implements ReportStrategy<string> {
  readonly name = 'historical-summary';

  async generate(tenantId: string) {
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
  }
}

class ReportContext {
  private strategies = new Map<string, ReportStrategy>();

  register<T extends ReportStrategy>(strategy: T): void {
    this.strategies.set(strategy.name, strategy);
  }

  get<T extends ReportStrategy>(name: string): T {
    const strategy = this.strategies.get(name);
    if (!strategy) {
      throw new Error(`Unknown report strategy: ${name}`);
    }
    return strategy as T;
  }

  async generate(name: string, input: any): Promise<any> {
    const strategy = this.get<ReportStrategy>(name);
    return strategy.generate(input);
  }
}

const context = new ReportContext();
context.register(new SalesReportStrategy());
context.register(new InventoryReportStrategy());
context.register(new ProfitabilityReportStrategy());
context.register(new BranchComparisonStrategy());
context.register(new HistoricalSummaryStrategy());

export const getSalesReport = (options: SalesReportOptions) =>
  context.generate('sales', options);

export const getInventoryReport = (options: InventoryReportOptions) =>
  context.generate('inventory', options);

export const getProfitabilityReport = (
  tenantId: string,
  startDate?: Date,
  endDate?: Date,
  branchId?: string
) => context.generate('profitability', { tenantId, startDate, endDate, branchId });

export const getBranchComparison = (tenantId: string, startDate: Date, endDate: Date) =>
  context.generate('branches', { tenantId, startDate, endDate });

export const getHistoricalSummary = (tenantId: string) =>
  context.generate('historical-summary', tenantId);


