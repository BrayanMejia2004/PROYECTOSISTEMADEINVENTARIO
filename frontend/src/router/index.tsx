import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { PermissionRoute } from './PermissionRoute';
import { AppShell } from '@/components/layout/AppShell';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterTenantPage } from '@/pages/RegisterTenantPage';
import { BlockedPage } from '@/pages/BlockedPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { CashierShiftPage } from '@/pages/CashierShiftPage';
import { InventoryPage } from '@/pages/InventoryPage';
import { DepartmentsPage } from '@/pages/DepartmentsPage';
import { PosPage } from '@/pages/PosPage';
import { SalesPage } from '@/pages/SalesPage';
import { SuppliersPage } from '@/pages/SuppliersPage';
import { ReportsPage } from '@/pages/ReportsPage';
import { UsersPage } from '@/pages/UsersPage';
import { CustomersPage } from '@/pages/CustomersPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { ProductFormPage } from '@/pages/ProductFormPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<RegisterTenantPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/bloqueado" element={<BlockedPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/caja" element={<CashierShiftPage />} />
            <Route path="/inventory" element={<PermissionRoute roles={['owner', 'admin']}><InventoryPage /></PermissionRoute>} />
            <Route path="/inventory/new" element={<PermissionRoute roles={['owner', 'admin']}><ProductFormPage /></PermissionRoute>} />
            <Route path="/inventory/:id/edit" element={<PermissionRoute roles={['owner', 'admin']}><ProductFormPage /></PermissionRoute>} />
            <Route path="/departments" element={<PermissionRoute roles={['owner', 'admin']}><DepartmentsPage /></PermissionRoute>} />
            <Route path="/pos" element={<PermissionRoute roles={['owner', 'admin', 'cashier']}><Navigate to="/pos/1" replace /></PermissionRoute>} />
            <Route path="/pos/:cartId" element={<PermissionRoute roles={['owner', 'admin', 'cashier']}><PosPage /></PermissionRoute>} />
            <Route path="/sales" element={<PermissionRoute roles={['owner', 'admin']}><SalesPage /></PermissionRoute>} />
            <Route path="/suppliers" element={<PermissionRoute roles={['owner', 'admin']}><SuppliersPage /></PermissionRoute>} />
            <Route path="/customers" element={<PermissionRoute roles={['owner', 'admin']}><CustomersPage /></PermissionRoute>} />
            <Route path="/reports" element={<PermissionRoute roles={['owner']}><ReportsPage /></PermissionRoute>} />
            <Route path="/users" element={<PermissionRoute roles={['owner', 'admin']}><UsersPage /></PermissionRoute>} />
            <Route path="/settings" element={<PermissionRoute roles={['owner']}><SettingsPage /></PermissionRoute>} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};
