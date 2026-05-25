import { useEffect, useState } from 'react';
import { getSalesSummary } from '../../sales/api';
import { formatCurrency, formatNumber } from '../../../lib/utils';
import { DollarSign } from 'lucide-react';

export const MonthlySalesCard = () => {
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [salesCount, setSalesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
          .toISOString().split('T')[0];
        const endOfMonth = now.toISOString().split('T')[0];

        const response = await getSalesSummary({ startDate: startOfMonth, endDate: endOfMonth });
        const s = response.data || {};
        setTotalRevenue(s.totalRevenue || 0);
        setSalesCount(s.salesToday || 0);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6"><p className="text-sm text-brand-muted">Cargando...</p></div>;

  const avgTicket = salesCount > 0 ? Math.round(totalRevenue / salesCount) : 0;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-brand-muted uppercase tracking-wider">Ventas del Mes</p>
        <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center">
          <DollarSign className="w-4 h-4 text-brand" />
        </div>
      </div>
      <p className="text-2xl font-sans font-bold text-brand-text">{formatCurrency(totalRevenue)}</p>
      <div className="flex items-center justify-between mt-2 text-xs text-brand-muted">
        <span>{formatNumber(salesCount)} venta{salesCount !== 1 ? 's' : ''}</span>
        <span>Ticket prom: {formatCurrency(avgTicket)}</span>
      </div>
    </div>
  );
};
