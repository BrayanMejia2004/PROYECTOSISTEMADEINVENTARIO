import { useEffect, useState } from 'react';
import { getProfitabilityReport } from '../api';
import { formatCurrency, formatNumber } from '../../../lib/utils';
import { DollarSign, AlertCircle } from 'lucide-react';

export const InventoryCostCard = () => {
  const [totalCost, setTotalCost] = useState(0);
  const [totalUnits, setTotalUnits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getProfitabilityReport();

        const products = response.data || [];
        const cost = products.reduce((sum: number, p: any) => sum + (p.totalCost || 0), 0);
        const units = products.reduce((sum: number, p: any) => sum + (p.totalSold || 0), 0);
        setTotalCost(cost);
        setTotalUnits(units);
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
          <p className="text-xs font-medium text-red-600">Error</p>
        </div>
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 h-full">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-brand-muted uppercase tracking-wider">Costo de Ventas</p>
        <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
          <DollarSign className="w-4 h-4 text-amber-600" />
        </div>
      </div>
      <p className="text-2xl font-sans font-bold text-brand-text">{formatCurrency(totalCost)}</p>
      <p className="text-xs text-brand-muted mt-2">{formatNumber(totalUnits)} unidades vendidas</p>
    </div>
  );
};
