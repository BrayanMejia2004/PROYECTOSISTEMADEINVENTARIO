export const Events = {
  SALE_CREATED: 'sale:created',
  SALE_REFUNDED: 'sale:refunded',
  STOCK_MOVED: 'stock:moved',
  USER_LOGIN: 'user:login',
  USER_LOGOUT: 'user:logout',
  PRODUCT_CREATED: 'product:created',
  PRODUCT_UPDATED: 'product:updated',
} as const;

export interface SaleCreatedEvent {
  saleId: string;
  saleNumber: string;
  tenantId: string;
  branchId: string;
  userId: string;
  customerId?: string;
  customerName?: string;
  total: number;
  paymentMethod: string;
  items: Array<{ productId: string; quantity: number; unitPrice: number }>;
}

export interface SaleRefundedEvent {
  saleId: string;
  saleNumber: string;
  tenantId: string;
  branchId: string;
  total: number;
}

export interface StockMovedEvent {
  tenantId: string;
  branchId: string;
  productId: string;
  type: string;
  quantity: number;
  newQuantity: number;
}

export interface UserLoginEvent {
  userId: string;
  tenantId: string;
  ip?: string;
}

export interface UserLogoutEvent {
  userId: string;
  tenantId: string;
}
