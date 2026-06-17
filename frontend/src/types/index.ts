export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'owner' | 'admin' | 'cashier';
  branchId?: string;
  isActive: boolean;
}

export interface Tenant {
  _id: string;
  name: string;
  slug: string;
  email: string;
  phone?: string;
  address?: string;
  nit?: string;
  logo?: string;
  brandColor?: string;
  brandColorLight?: string;
  brandColorDark?: string;
  brandSidebar?: string;
  isActive: boolean;
}

export interface Branch {
  _id: string;
  tenantId: string;
  name: string;
  address?: string;
  phone?: string;
  isActive: boolean;
}

export interface Product {
  id: string;
  tenantId: string;
  sku: string;
  barcode?: string;
  name: string;
  description?: string;
  departmentId?: string;
  departmentName?: string;
  stock?: number;
  brandId?: string;
  supplierId?: string;
  image?: string;
  costPrice: number;
  price: number;
  wholesalePrice?: number;
  specialPrice?: number;
  applyTax: boolean;
  taxPercentage: number;
  allowsDiscount: boolean;
  maxDiscount: number;
  minStock: number;
  maxStock: number;
  sellOutOfStock: boolean;
  unit: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Stock {
  _id: string;
  tenantId: string;
  branchId: string;
  productId: string;
  quantity: number;
  price: number;
  productName?: string;
  sku?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  costPrice: number;
  total: number;
}

export interface Sale {
  _id: string;
  tenantId: string;
  saleNumber: string;
  branchId: string;
  userId: string;
  userName?: string;
  customerId?: string;
  customerName?: string;
  items: SaleItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'transfer' | 'exchange';
  status: 'completed' | 'cancelled' | 'refunded' | 'pending' | 'partial';
  transferReference?: string;
  transferAmount?: number;
  transferBank?: string;
  cardBank?: string;
  cardReference?: string;
  exchangeFromSaleId?: string;
  exchangeCredit?: number;
  availableExchangeCredit?: number;
  createdAt: string;
}

export interface Brand {
  _id: string;
  tenantId: string;
  name: string;
  isActive: boolean;
}

export interface Department {
  _id: string;
  tenantId: string;
  name: string;
  parentId?: string;
  isActive: boolean;
}

export interface Supplier {
  _id: string;
  tenantId: string;
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  isActive: boolean;
}

export interface CashierShift {
  _id: string;
  tenantId: string;
  branchId: string;
  userId: string;
  openingBalance: number;
  closingBalance?: number;
  totalSales: number;
  totalCash: number;
  totalCard: number;
  totalTransfer: number;
  totalProfit: number;
  totalEntries: number;
  totalExits: number;
  status: 'open' | 'closed';
  openedAt: string;
  closedAt?: string;
  createdAt: string;
  userName?: string;
  branchName?: string;
}

export interface CashMovement {
  _id: string;
  tenantId: string;
  branchId: string;
  shiftId: string;
  userId: string;
  type: 'entry' | 'exit';
  amount: number;
  reason: string;
  createdAt: string;
  userName?: string;
}

export interface SalesSummary {
  salesToday: number;
  totalRevenue: number;
  avgTicket: number;
  cancelledCount: number;
  totalProductsSold: number;
  totalProfit: number;
  totalCost: number;
  cashTotal: number;
  cashCount: number;
  cardTotal: number;
  cardCount: number;
  transferTotal: number;
  transferCount: number;
}

export interface DailySalesData {
  _id: string;
  totalSales: number;
  count: number;
  subtotal: number;
  tax: number;
  discount: number;
}

export interface BranchComparisonData {
  _id: string;
  totalSales: number;
  count: number;
  averageTicket: number;
  branchName: string;
}

export interface ProductProfitData {
  productName: string;
  sku: string;
  totalSold: number;
  totalRevenue: number;
  totalCost: number;
  profit: number;
  margin: number;
}

export interface BranchInventoryData {
  _id: string;
  branchName: string;
  totalItems: number;
  totalValue: number;
  totalCost: number;
  lowStock: number;
}

export interface CreateSaleInput {
  customerName?: string;
  customerPhone?: string;
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
  }>;
  tax?: number;
  discount?: number;
  paymentMethod: 'cash' | 'card' | 'transfer' | 'exchange';
  transferReference?: string;
  transferAmount?: number;
  transferBank?: string;
  cardBank?: string;
  cardReference?: string;
  exchangeFromSaleId?: string;
  exchangeCredit?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface LoginResponse {
  accessToken: string;
  user: User;
  tenant: Tenant;
}

export interface RefreshResponse {
  accessToken: string;
  user: User;
  tenant: Tenant;
}
