import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { AppShell } from '../components/layout/AppShell';
import { LoginPage } from '../pages/LoginPage';
import { RegisterTenantPage } from '../pages/RegisterTenantPage';
import { DashboardPage } from '../pages/DashboardPage';
import { CashierShiftPage } from '../pages/CashierShiftPage';
import { InventoryPage } from '../pages/InventoryPage';
import { DepartmentsPage } from '../pages/DepartmentsPage';
import { PosPage } from '../pages/PosPage';
import { SalesPage } from '../pages/SalesPage';
import { SuppliersPage } from '../pages/SuppliersPage';
import { ReportsPage } from '../pages/ReportsPage';
import { UsersPage } from '../pages/UsersPage';
import { CustomersPage } from '../pages/CustomersPage';
import { SettingsPage } from '../pages/SettingsPage';
import { ProductFormPage } from '../pages/ProductFormPage';
import { NotFoundPage } from '../pages/NotFoundPage';

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<RegisterTenantPage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/caja" element={<CashierShiftPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/inventory/new" element={<ProductFormPage />} />
            <Route path="/inventory/:id/edit" element={<ProductFormPage />} />
            <Route path="/departments" element={<DepartmentsPage />} />
            <Route path="/pos" element={<Navigate to="/pos/1" replace />} />
            <Route path="/pos/:cartId" element={<PosPage />} />
            <Route path="/sales" element={<SalesPage />} />
            <Route path="/suppliers" element={<SuppliersPage />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};
