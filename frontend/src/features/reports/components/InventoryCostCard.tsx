import { useEffect, useState } from 'react';
import { getProfitabilityReport, getHistoricalSummary } from '@/features/reports/api';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { DollarSign, AlertCircle } from 'lucide-react';
import { CardSkeleton } from '@/components/ui/CardSkeleton';

export const InventoryCostCard = () => {
  const [totalCost, setTotalCost] = useState(0);
  const [totalUnits, setTotalUnits] = useState(0);
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
        const cost = products.reduce((sum: number, p: any) => sum + (p.totalCost || 0), 0);
        const units = products.reduce((sum: number, p: any) => sum + (p.totalSold || 0), 0);

        const historicalCost = historicalResponse.data?.totalCost || 0;

        setTotalCost(cost + historicalCost);
        setTotalUnits(units);
      } catch (err) {
        setError((err as any)?.message || 'Error al cargar');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <CardSkeleton />;

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
    <div className="bg-white rounded-xl border border-border-light shadow-soft p-6 h-full">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-brand-muted">Costo de ventas</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-brand-text">{formatCurrency(totalCost)}</p>
        </div>
        <div className="mt-0.5 p-1.5 rounded-lg bg-stock-move-soft text-stock-move">
          <DollarSign className="w-4 h-4" />
        </div>
      </div>
      <p className="text-xs text-brand-muted mt-2">{formatNumber(totalUnits)} unidades vendidas</p>
    </div>
  );
};
