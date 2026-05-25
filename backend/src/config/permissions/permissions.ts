export const PERMISSIONS = {
  // Inventario
  'inventory:read': ['owner', 'admin', 'cashier'],
  'inventory:create': ['owner', 'admin'],
  'inventory:update': ['owner', 'admin'],
  'inventory:delete': ['owner', 'admin'],
  'inventory:adjust': ['owner', 'admin'],
  'inventory:set-price': ['owner', 'admin'],
  'inventory:view-cost': ['owner', 'admin'],

  // Ventas
  'sales:create': ['owner', 'admin', 'cashier'],
  'sales:read': ['owner', 'admin', 'cashier'],
  'sales:read-all': ['owner', 'admin'],
  'sales:cancel': ['owner', 'admin'],
  'sales:cancel-own': ['cashier'],
  'sales:refund': ['owner', 'admin'],
  'sales:apply-discount': ['owner', 'admin', 'cashier'],

  // Proveedores
  'suppliers:read': ['owner', 'admin'],
  'suppliers:create': ['owner', 'admin'],
  'suppliers:update': ['owner', 'admin'],
  'suppliers:delete': ['owner', 'admin'],

  // Reportes
  'reports:branch': ['owner'],
  'reports:global': ['owner'],
  'reports:financial': ['owner'],

  // Usuarios
  'users:read': ['owner', 'admin'],
  'users:create-cashier': ['owner'],

  // Tenant
  'branches:read': ['owner', 'admin', 'cashier'],
  'tenant:manage-branches': ['owner'],
} as const;

export type Permission = keyof typeof PERMISSIONS;
