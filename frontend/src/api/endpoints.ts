export const ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER_TENANT: '/auth/register-tenant',
  REFRESH_TOKEN: '/auth/refresh',
  PROFILE: '/auth/profile',
  LOGOUT: '/auth/logout',

  // Tenant
  TENANT: '/tenant',
  TENANT_SETTINGS: '/tenant/settings',

  // Branches
  BRANCHES: '/branches',

  // Users
  USERS: '/users',

  // Brands
  BRANDS: '/brands',

  // Departments
  DEPARTMENTS: '/departments',

  // Suppliers
  SUPPLIERS: '/suppliers',

  // Products
  PRODUCTS: '/products',
  PRODUCTS_BARCODE: '/products/barcode',
  PRODUCTS_IMPORT: '/products/import',
  PRODUCTS_UPLOAD_IMAGE: '/products/upload-image',

  // Stock
  STOCK: '/stock',
  STOCK_LOW: '/stock/low',
  STOCK_OUT: '/stock/out',

  // Sales
  SALES: '/sales',

  // Reports
  REPORTS_SALES: '/reports/sales',
  REPORTS_INVENTORY: '/reports/inventory',
  REPORTS_PROFITABILITY: '/reports/profitability',
  REPORTS_BRANCHES: '/reports/branches',
  REPORTS_HISTORICAL_SUMMARY: '/reports/historical-summary',

  // Cashier Shifts
  CASHIER_SHIFTS: '/cashier-shifts',
  CASHIER_SHIFTS_OPEN: '/cashier-shifts/open',
  CASHIER_SHIFTS_CURRENT: '/cashier-shifts/current',
};
