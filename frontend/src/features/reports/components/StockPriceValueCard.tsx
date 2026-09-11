import { useEffect, useState } from 'react';
import { getInventoryReport } from '@/features/reports/api';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { Package } from 'lucide-react';
import { CardSkeleton } from '@/components/ui/CardSkeleton';

export const StockPriceValueCard = () => {
  const [totalValue, setTotalValue] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getInventoryReport();
        const branches = response.data || [];
        const value = branches.reduce((sum: number, branch: any) => sum + (branch.totalValue || 0), 0);
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

  if (loading) return <CardSkeleton />;

  return (
    <div className="bg-white rounded-xl border border-border-light shadow-soft p-6 h-full">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-brand-muted">Valor del inventario (precio)</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-brand-text">{formatCurrency(totalValue)}</p>
        </div>
        <div className="mt-0.5 p-1.5 rounded-lg bg-brand-bg text-brand">
          <Package className="w-4 h-4" />
        </div>
      </div>
      <p className="text-xs text-brand-muted mt-2">{formatNumber(totalItems)} productos en total</p>
    </div>
  );
};
