import { useAuth } from '@/context/AuthContext';

const PERMISSIONS_MAP: Record<string, string[]> = {
  'owner': [
    'inventory:read', 'inventory:create', 'inventory:update', 'inventory:delete',
    'inventory:adjust', 'inventory:set-price', 'inventory:view-cost',
    'sales:create', 'sales:read', 'sales:read-all', 'sales:cancel', 'sales:refund', 'sales:apply-discount',
    'suppliers:read',
    'reports:branch', 'reports:global', 'reports:financial',
    'users:read', 'users:create-cashier',
    'tenant:manage-branches'
  ],
  'admin': [
    'inventory:read', 'inventory:create', 'inventory:update', 'inventory:delete',
    'inventory:adjust', 'inventory:set-price', 'inventory:view-cost',
    'sales:create', 'sales:read', 'sales:read-all', 'sales:cancel', 'sales:refund', 'sales:apply-discount',
    'suppliers:read',
    'users:read',
  ],
  'cashier': [
    'inventory:read',
    'sales:create', 'sales:read', 'sales:cancel-own', 'sales:apply-discount',
  ],
};

export const usePermission = () => {
  const { user } = useAuth();

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    const rolePermissions = PERMISSIONS_MAP[user.role] || [];
    return rolePermissions.includes(permission);
  };

  return { hasPermission };
};
