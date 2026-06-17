import type mongoose from 'mongoose';

type MongoId = string | mongoose.Types.ObjectId;

export interface BranchScopedFilter {
  tenantId: string;
  _id?: string;
  isActive?: boolean;
  $or?: Array<{ branchId: string } | { branchId: { $exists: boolean } }>;
  name?: { $regex: string; $options: string };
  phone?: { $regex: string; $options: string };
  email?: { $regex: string; $options: string };
}

export interface PaginationFilter {
  page?: number;
  limit?: number;
}

export interface SaleFilter {
  tenantId: MongoId;
  branchId?: string;
  _id?: string;
  status?: string;
  paymentMethod?: string;
  customerName?: { $regex: string; $options: string };
  userId?: string;
  saleNumber?: { $regex: string; $options: string };
  total?: { $gte?: number; $lte?: number };
  createdAt?: { $gte?: Date; $lte?: Date };
  $or?: Array<Record<string, any>>;
  exchangeFromSaleId?: { $ne: null };
}

export interface ProductFilter {
  tenantId: MongoId;
  _id?: { $in: MongoId[] };
  isActive?: boolean;
  name?: { $regex: string; $options: string };
  sku?: { $regex: string; $options: string } | string;
  barcode?: string | { $regex: string; $options: string };
  departmentId?: MongoId;
  supplierId?: MongoId;
  $or?: Array<{
    name?: { $regex: string; $options: string };
    sku?: { $regex: string; $options: string };
    barcode?: { $regex: string; $options: string } | string;
  }>;
}

export interface StockFilter {
  tenantId: MongoId;
  branchId?: string;
  isLowStock?: boolean;
  quantity?: number | { $gte?: number; $lte?: number };
}

export interface ShiftFilter {
  tenantId: MongoId;
  branchId?: MongoId;
  userId?: MongoId;
  status?: string;
  openedAt?: { $gte?: Date; $lte?: Date };
}

export interface DailySalesAggregation {
  _id: string;
  totalSales: number;
  count: number;
  subtotal: number;
  tax: number;
  discount: number;
}

export interface SalesTotalsAggregation {
  totalSales: number;
  totalCount: number;
}

export interface BranchInventoryAggregation {
  _id: string;
  branchName: string;
  totalItems: number;
  totalValue: number;
  totalCost: number;
  lowStock: number;
}

export interface ProductProfitAggregation {
  _id: string;
  productName: string;
  sku: string;
  totalSold: number;
  totalRevenue: number;
  totalCost: number;
  profit: number;
  margin: number;
}

export interface BranchComparisonAggregation {
  _id: string;
  totalSales: number;
  count: number;
  averageTicket: number;
  branchName: string;
}

export interface HistoricalSummaryAggregation {
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
}

export interface PaymentMethodAggregation {
  _id: string;
  total: number;
  count: number;
}

export interface ProductCostAggregation {
  totalCost: number;
}

export interface PopulatedProductInfo {
  _id?: string;
  name: string;
  sku: string;
  minStock: number;
  barcode?: string;
}

export interface PopulatedBranchInfo {
  _id?: string;
  name: string;
}

export interface PopulatedStockRecord {
  _id: string;
  tenantId: string;
  branchId: string | PopulatedBranchInfo;
  productId: string | PopulatedProductInfo;
  quantity: number;
  price: number;
  isLowStock: boolean;
  createdAt: string;
}

export interface ShiftMovementAggregation {
  _id: string;
  total: number;
}

export interface CustomerFilter {
  tenantId: string;
  isActive?: boolean;
  _id?: string;
  name?: { $regex: string; $options: string } | string;
  phone?: string;
  email?: { $regex: string; $options: string };
  $or?: Array<{
    name?: { $regex: string; $options: string };
    phone?: { $regex: string; $options: string };
    email?: { $regex: string; $options: string };
  }>;
}
