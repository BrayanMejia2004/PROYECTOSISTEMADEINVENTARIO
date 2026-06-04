import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const PERMISSION_ROLES: Record<string, string[]> = {
  'inventory:read': ['owner', 'admin', 'cashier'],
  'inventory:create': ['owner', 'admin'],
  'inventory:update': ['owner', 'admin'],
  'inventory:delete': ['owner', 'admin'],
  'sales:create': ['owner', 'admin', 'cashier'],
  'sales:read': ['owner', 'admin', 'cashier'],
  'sales:refund': ['owner', 'admin'],
  'suppliers:read': ['owner', 'admin'],
  'reports:branch': ['owner'],
  'users:read': ['owner', 'admin'],
  'users:create': ['owner', 'admin'],
};

interface PermissionRouteProps {
  children: React.ReactNode;
  roles?: string[];
  permission?: string;
}

export const PermissionRoute = ({ children, roles, permission }: PermissionRouteProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen text-sm text-brand-muted">Cargando...</div>;
  }

  const allowedRoles = roles ?? (permission ? PERMISSION_ROLES[permission] ?? [] : []);

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
