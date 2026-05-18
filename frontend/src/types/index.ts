export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'owner' | 'admin' | 'cashier';
  branchId?: string;
  isActive: boolean;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone?: string;
  address?: string;
  nit?: string;
  isActive: boolean;
}

export interface Branch {
  id: string;
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

export interface StockMovement {
  _id: string;
  tenantId: string;
  branchId: string;
  productId: string;
  type: 'sale' | 'return' | 'adjustment' | 'transfer';
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  note?: string;
  createdAt: string;
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
