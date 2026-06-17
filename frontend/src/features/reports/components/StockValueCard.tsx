import { useEffect, useState } from 'react';
import { getInventoryReport } from '@/features/reports/api';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { Package } from 'lucide-react';

export const StockValueCard = () => {
  const [totalValue, setTotalValue] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getInventoryReport();
        const branches = response.data || [];
        const value = branches.reduce((sum: number, branch: any) => sum + (branch.totalCost || 0), 0);
        const items = branches.reduce((sum: number, branch: any) => sum + (branch.totalItems || 0), 0);
        setTotalValue(value);
        setTotalItems(items);
      } catch (error) {
        console.error('Error fetching inventory report:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6"><p className="text-sm text-brand-muted">Cargando...</p></div>;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 h-full">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-brand-muted uppercase tracking-wider">Valor del Inventario (Costo)</p>
        <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center">
          <Package className="w-4 h-4 text-brand" />
        </div>
      </div>
      <p className="text-2xl font-sans font-bold text-brand-text">{formatCurrency(totalValue)}</p>
      <p className="text-xs text-brand-muted mt-2">{formatNumber(totalItems)} productos en total</p>
    </div>
  );
};
