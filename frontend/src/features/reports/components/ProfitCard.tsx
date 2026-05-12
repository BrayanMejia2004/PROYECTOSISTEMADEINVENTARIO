import { useEffect, useState } from 'react';
import { getProfitabilityReport } from '../api';
import { formatCurrency } from '../../../lib/utils';
import { TrendingUp } from 'lucide-react';

export const ProfitCard = () => {
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getProfitabilityReport();
        const products = response.data || [];
        const revenue = products.reduce((sum: number, p: any) => sum + (p.totalRevenue || 0), 0);
        const cost = products.reduce((sum: number, p: any) => sum + (p.totalCost || 0), 0);
        setTotalRevenue(revenue);
        setTotalCost(cost);
        setTotalProfit(revenue - cost);
      } catch (error) {
        console.error('Error fetching profitability report:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6"><p className="text-sm text-brand-muted">Cargando...</p></div>;

  const margin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : '0.0';

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-brand-muted uppercase tracking-wider">Ganancias</p>
        <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
          <TrendingUp className="w-4 h-4 text-green-600" />
        </div>
      </div>
      <p className="text-2xl font-sans font-bold text-green-600">{formatCurrency(totalProfit)}</p>
      <div className="flex items-center justify-between mt-2 text-xs text-brand-muted">
        <span>Ingresos: {formatCurrency(totalRevenue)}</span>
        <span>Costos: {formatCurrency(totalCost)}</span>
      </div>
      <p className="text-xs text-brand-muted mt-1">Margen: {margin}%</p>
    </div>
  );
};
