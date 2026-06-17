import { useEffect, useState } from 'react';
import { getProfitabilityReport, getHistoricalSummary } from '@/features/reports/api';
import { formatCurrency } from '@/lib/utils';
import { DollarSign, AlertCircle } from 'lucide-react';

export const SalesProfitCard = () => {
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profitResponse, historicalResponse] = await Promise.all([
          getProfitabilityReport(),
          getHistoricalSummary(),
        ]);

        const products = profitResponse.data || [];
        const revenue = products.reduce((sum: number, p: any) => sum + (p.totalRevenue || 0), 0);
        const cost = products.reduce((sum: number, p: any) => sum + (p.totalCost || 0), 0);

        const historicalRevenue = historicalResponse.data?.totalRevenue || 0;
        const historicalCost = historicalResponse.data?.totalCost || 0;

        setTotalRevenue(revenue + historicalRevenue);
        setTotalCost(cost + historicalCost);
        setTotalProfit((revenue - cost) + (historicalRevenue - historicalCost));
      } catch (err) {
        setError((err as any)?.message || 'Error al cargar');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6"><p className="text-sm text-brand-muted">Cargando...</p></div>;

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-red-200 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <p className="text-xs font-medium text-red-600">Error en ganancias</p>
        </div>
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  const margin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : '0.0';

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 h-full">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-brand-muted uppercase tracking-wider">Ganancia Real</p>
        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
          <DollarSign className="w-4 h-4 text-blue-600" />
        </div>
      </div>
      <p className="text-2xl font-sans font-bold text-blue-600">{formatCurrency(totalProfit)}</p>
      <div className="flex items-center justify-between mt-2 text-xs text-brand-muted">
        <span>Total ventas: {formatCurrency(totalRevenue)}</span>
        <span>Inversión: {formatCurrency(totalCost)}</span>
      </div>
      <p className="text-xs text-brand-muted mt-1">Margen: {margin}%</p>
    </div>
  );
};
