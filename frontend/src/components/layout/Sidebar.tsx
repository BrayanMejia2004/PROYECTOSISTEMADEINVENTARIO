import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { usePermission } from '../../hooks/usePermission';
import { useBranches } from '../../features/settings/hooks';
import { cn } from '../../lib/utils';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Receipt,
  Tag,
  Users,
  BarChart3,
  Settings,
  UserCircle,
  LogOut,
  Store,
  Contact,
  Wallet,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { user, logout, tenant } = useAuth();
  const { hasPermission } = usePermission();
  const { data: branches } = useBranches();
  const branchName = user?.branchId ? branches?.data?.find((b: any) => b._id === user.branchId)?.name : null;

  if (!user) return null;

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={onClose} />}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-40 w-64 min-h-screen bg-brand-sidebar flex flex-col shrink-0",
        "transform transition-transform duration-200 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full",
        "lg:translate-x-0"
      )}>
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center">
            <Store className="w-4 h-4 text-white" />
          </div>
          <span className="font-sans font-semibold text-base text-white/90">
            {tenant?.name || 'InventoPro'}
          </span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <NavItem to="/" icon={<LayoutDashboard className="w-4 h-4" />} label="Inicio" end />
          {(user.role === 'cashier' || user.role === 'admin' || user.role === 'owner') && (
            <NavItem to="/caja" icon={<Wallet className="w-4 h-4" />} label="Gestión de Caja" />
          )}

          {user.role !== 'cashier' && (
            <>
              {hasPermission('inventory:read') && (
                <NavItem to="/inventory" icon={<Package className="w-4 h-4" />} label="Inventario" />
              )}
              {(user?.role as string) === 'cashier' && (
                <NavItem to="/pos" icon={<ShoppingCart className="w-4 h-4" />} label="Punto de Venta" />
              )}
              {hasPermission('sales:read') && (
                <NavItem to="/sales" icon={<Receipt className="w-4 h-4" />} label="Ventas" />
              )}
              {hasPermission('inventory:create') && user?.role !== 'owner' && (
                <NavItem to="/departments" icon={<Tag className="w-4 h-4" />} label="Departamentos" />
              )}
              {hasPermission('suppliers:read') && (
                <NavItem to="/suppliers" icon={<Users className="w-4 h-4" />} label="Proveedores" />
              )}
              {hasPermission('sales:read') && (
                <NavItem to="/customers" icon={<Contact className="w-4 h-4" />} label="Clientes" />
              )}
              {hasPermission('reports:branch') && (
                <NavItem to="/reports" icon={<BarChart3 className="w-4 h-4" />} label="Reportes" />
              )}
              {hasPermission('users:read') && (
                <NavItem to="/users" icon={<UserCircle className="w-4 h-4" />} label="Usuarios" />
              )}
              {hasPermission('tenant:manage-branches') && (
                <NavItem to="/settings" icon={<Settings className="w-4 h-4" />} label="Configuración" />
              )}
            </>
          )}
        </nav>

        <div className="px-4 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-brand/20 flex items-center justify-center text-xs font-medium text-brand-light">
              {user.firstName?.[0]}{user.lastName?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white/80 truncate">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-white/40 truncate">{user.role}</p>
              {user.role !== 'owner' && branchName && <p className="text-xs text-white/30 truncate mt-0.5">{branchName}</p>}
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-white/50 hover:text-white/80 hover:bg-white/5 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
};

const NavItem = ({ to, icon, label, end }: { to: string; icon: React.ReactNode; label: string; end?: boolean }) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) =>
      `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 ${isActive
        ? 'bg-brand text-white font-medium shadow-sm shadow-brand/20'
        : 'text-white/60 hover:text-white/80 hover:bg-white/5'
      }`
    }
  >
    {icon}
    <span>{label}</span>
  </NavLink>
);
