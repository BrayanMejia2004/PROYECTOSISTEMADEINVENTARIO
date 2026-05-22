import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface PermissionRouteProps {
  children: React.ReactNode;
  roles: string[];
}

export const PermissionRoute = ({ children, roles }: PermissionRouteProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen text-sm text-brand-muted">Cargando...</div>;
  }

  if (!user || !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
