import type { Product, Sale, Stock, Brand, Department, Supplier, User, Tenant, Branch, SaleItem } from '../types';

interface RawProduct {
  _id: string;
  id?: string;
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
  [key: string]: any;
}

interface RawSale {
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
  paymentMethod: string;
  status: string;
  transferReference?: string;
  transferAmount?: number;
  transferBank?: string;
  cardBank?: string;
  cardReference?: string;
  exchangeFromSaleId?: string;
  exchangeCredit?: number;
  availableExchangeCredit?: number;
  createdAt: string;
  [key: string]: any;
}

interface RawStock {
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
  [key: string]: any;
}

function ensureId<T extends { _id: string; id?: string }>(raw: T): T & { id: string } {
  return { ...raw, id: raw.id || raw._id };
}

export const adaptProduct = (raw: RawProduct): Product => ensureId(raw);
export const adaptProducts = (raw: RawProduct[]): Product[] => raw.map(adaptProduct);

export const adaptSale = (raw: RawSale): Sale => ensureId(raw);
export const adaptSales = (raw: RawSale[]): Sale[] => raw.map(adaptSale);

export const adaptStock = (raw: RawStock): Stock => raw;
export const adaptStocks = (raw: RawStock[]): Stock[] => raw;

export const adaptBrand = (raw: { _id: string; [key: string]: any }): Brand => ensureId(raw as any);
export const adaptDepartment = (raw: { _id: string; [key: string]: any }): Department => ensureId(raw as any);
export const adaptSupplier = (raw: { _id: string; [key: string]: any }): Supplier => ensureId(raw as any);
export const adaptUser = (raw: { id?: string; [key: string]: any }): User => raw as User;
export const adaptTenant = (raw: { id?: string; [key: string]: any }): Tenant => raw as Tenant;
export const adaptBranch = (raw: { id?: string; [key: string]: any }): Branch => raw as Branch;
