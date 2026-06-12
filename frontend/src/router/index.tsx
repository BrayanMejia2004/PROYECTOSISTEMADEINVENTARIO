import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { PermissionRoute } from './PermissionRoute';
import { AppShell } from '../components/layout/AppShell';
import { PageLoader } from '../components/ui/PageLoader';

const loadPage = (path: string, name: string) => lazy(() => import(path).then(m => ({ default: (m as any)[name] })));

const LoginPage = loadPage('../pages/LoginPage', 'LoginPage');
const RegisterTenantPage = loadPage('../pages/RegisterTenantPage', 'RegisterTenantPage');
const DashboardPage = loadPage('../pages/DashboardPage', 'DashboardPage');
const CashierShiftPage = loadPage('../pages/CashierShiftPage', 'CashierShiftPage');
const InventoryPage = loadPage('../pages/InventoryPage', 'InventoryPage');
const DepartmentsPage = loadPage('../pages/DepartmentsPage', 'DepartmentsPage');
const PosPage = loadPage('../pages/PosPage', 'PosPage');
const SalesPage = loadPage('../pages/SalesPage', 'SalesPage');
const SuppliersPage = loadPage('../pages/SuppliersPage', 'SuppliersPage');
const ReportsPage = loadPage('../pages/ReportsPage', 'ReportsPage');
const UsersPage = loadPage('../pages/UsersPage', 'UsersPage');
const CustomersPage = loadPage('../pages/CustomersPage', 'CustomersPage');
const SettingsPage = loadPage('../pages/SettingsPage', 'SettingsPage');
const ProductFormPage = loadPage('../pages/ProductFormPage', 'ProductFormPage');
const NotFoundPage = loadPage('../pages/NotFoundPage', 'NotFoundPage');

const L = (Component: React.LazyExoticComponent<React.ComponentType<any>>) => (
  <Suspense fallback={<PageLoader />}><Component /></Suspense>
);

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={L(RegisterTenantPage)} />
        <Route path="/login" element={L(LoginPage)} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/" element={L(DashboardPage)} />
            <Route path="/caja" element={L(CashierShiftPage)} />
            <Route path="/inventory" element={<PermissionRoute roles={['owner', 'admin']}>{L(InventoryPage)}</PermissionRoute>} />
            <Route path="/inventory/new" element={<PermissionRoute roles={['owner', 'admin']}>{L(ProductFormPage)}</PermissionRoute>} />
            <Route path="/inventory/:id/edit" element={<PermissionRoute roles={['owner', 'admin']}>{L(ProductFormPage)}</PermissionRoute>} />
            <Route path="/departments" element={<PermissionRoute roles={['owner', 'admin']}>{L(DepartmentsPage)}</PermissionRoute>} />
            <Route path="/pos" element={<PermissionRoute roles={['owner', 'admin', 'cashier']}><Navigate to="/pos/1" replace /></PermissionRoute>} />
            <Route path="/pos/:cartId" element={<PermissionRoute roles={['owner', 'admin', 'cashier']}>{L(PosPage)}</PermissionRoute>} />
            <Route path="/sales" element={<PermissionRoute roles={['owner', 'admin']}>{L(SalesPage)}</PermissionRoute>} />
            <Route path="/suppliers" element={<PermissionRoute roles={['owner', 'admin']}>{L(SuppliersPage)}</PermissionRoute>} />
            <Route path="/customers" element={<PermissionRoute roles={['owner', 'admin']}>{L(CustomersPage)}</PermissionRoute>} />
            <Route path="/reports" element={<PermissionRoute roles={['owner']}>{L(ReportsPage)}</PermissionRoute>} />
            <Route path="/users" element={<PermissionRoute roles={['owner', 'admin']}>{L(UsersPage)}</PermissionRoute>} />
            <Route path="/settings" element={<PermissionRoute roles={['owner']}>{L(SettingsPage)}</PermissionRoute>} />
          </Route>
        </Route>

        <Route path="*" element={L(NotFoundPage)} />
      </Routes>
    </BrowserRouter>
  );
};
