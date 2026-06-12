import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { PermissionRoute } from './PermissionRoute';
import { AppShell } from '../components/layout/AppShell';
import { PageLoader } from '../components/ui/PageLoader';

const LoginPage = lazy(() => import('../pages/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterTenantPage = lazy(() => import('../pages/RegisterTenantPage').then(m => ({ default: m.RegisterTenantPage })));
const DashboardPage = lazy(() => import('../pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const CashierShiftPage = lazy(() => import('../pages/CashierShiftPage').then(m => ({ default: m.CashierShiftPage })));
const InventoryPage = lazy(() => import('../pages/InventoryPage').then(m => ({ default: m.InventoryPage })));
const DepartmentsPage = lazy(() => import('../pages/DepartmentsPage').then(m => ({ default: m.DepartmentsPage })));
const PosPage = lazy(() => import('../pages/PosPage').then(m => ({ default: m.PosPage })));
const SalesPage = lazy(() => import('../pages/SalesPage').then(m => ({ default: m.SalesPage })));
const SuppliersPage = lazy(() => import('../pages/SuppliersPage').then(m => ({ default: m.SuppliersPage })));
const ReportsPage = lazy(() => import('../pages/ReportsPage').then(m => ({ default: m.ReportsPage })));
const UsersPage = lazy(() => import('../pages/UsersPage').then(m => ({ default: m.UsersPage })));
const CustomersPage = lazy(() => import('../pages/CustomersPage').then(m => ({ default: m.CustomersPage })));
const SettingsPage = lazy(() => import('../pages/SettingsPage').then(m => ({ default: m.SettingsPage })));
const ProductFormPage = lazy(() => import('../pages/ProductFormPage').then(m => ({ default: m.ProductFormPage })));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

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
