import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Store } from 'lucide-react';

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
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-brand flex items-center justify-center animate-pulse shadow-lg shadow-brand/20">
            <Store className="w-7 h-7 text-white" />
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="w-2 h-2 rounded-full bg-brand animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 rounded-full bg-brand-light animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 rounded-full bg-brand-dark animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <p className="text-sm text-brand-muted font-medium">Cargando...</p>
        </div>
      </div>
    );
  }

  const allowedRoles = roles ?? (permission ? PERMISSION_ROLES[permission] ?? [] : []);

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
