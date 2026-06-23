export type Role = 'owner' | 'admin' | 'cashier';

export const PERMISSIONS = {
  // Inventario
  'inventory:read': ['owner', 'admin', 'cashier'] as readonly Role[],
  'inventory:create': ['owner', 'admin'] as readonly Role[],
  'inventory:update': ['owner', 'admin'] as readonly Role[],
  'inventory:delete': ['owner', 'admin'] as readonly Role[],
  'inventory:adjust': ['owner', 'admin'] as readonly Role[],
  'inventory:set-price': ['owner', 'admin'] as readonly Role[],
  'inventory:view-cost': ['owner', 'admin'] as readonly Role[],

  // Ventas
  'sales:create': ['owner', 'admin', 'cashier'] as readonly Role[],
  'sales:read': ['owner', 'admin', 'cashier'] as readonly Role[],
  'sales:read-all': ['owner', 'admin'] as readonly Role[],
  'sales:cancel': ['owner', 'admin'] as readonly Role[],
  'sales:cancel-own': ['cashier'] as readonly Role[],
  'sales:refund': ['owner', 'admin'] as readonly Role[],
  'sales:apply-discount': ['owner', 'admin', 'cashier'] as readonly Role[],

  // Proveedores
  'suppliers:read': ['owner', 'admin'] as readonly Role[],
  'suppliers:create': ['owner', 'admin'] as readonly Role[],
  'suppliers:update': ['owner', 'admin'] as readonly Role[],
  'suppliers:delete': ['owner', 'admin'] as readonly Role[],

  // Reportes
  'reports:branch': ['owner'] as readonly Role[],
  'reports:global': ['owner'] as readonly Role[],
  'reports:financial': ['owner'] as readonly Role[],

  // Usuarios
  'users:read': ['owner', 'admin'] as readonly Role[],
  'users:create': ['owner', 'admin'] as readonly Role[],
  'users:update': ['owner', 'admin'] as readonly Role[],
  'users:delete': ['owner'] as readonly Role[],

  // Tenant
  'branches:read': ['owner', 'admin', 'cashier'] as readonly Role[],
  'tenant:manage-branches': ['owner'] as readonly Role[],
} as const;

export type Permission = keyof typeof PERMISSIONS;

export function hasPermission(role: Role, permission: Permission): boolean {
  const allowedRoles = PERMISSIONS[permission];
  return allowedRoles.includes(role);
}

export function getRolePermissions(role: Role): Permission[] {
  return (Object.keys(PERMISSIONS) as Permission[]).filter((permission) =>
    hasPermission(role, permission)
  );
}
