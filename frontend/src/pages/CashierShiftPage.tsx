import { useAuth } from '@/hooks/useAuth';
import { CashierShiftPanel } from '@/features/sales/components/CashierShiftPanel';
import { AdminShiftHistory } from '@/features/sales/components/AdminShiftHistory';

export const CashierShiftPage = () => {
  const { user } = useAuth();

  if (user?.role === 'cashier') {
    return <CashierShiftPanel />;
  }

  return <AdminShiftHistory />;
};
