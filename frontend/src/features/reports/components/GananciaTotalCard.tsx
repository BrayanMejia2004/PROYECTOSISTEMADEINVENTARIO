import { useInventorySummary } from '@/features/reports/hooks';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp } from 'lucide-react';
import { CardSkeleton } from '@/components/ui/CardSkeleton';

export const GananciaTotalCard = () => {
  const { data, isLoading } = useInventorySummary();
  const branches = data?.data ?? [];
  const value = branches.reduce((sum: number, branch: any) => sum + (branch.totalValue || 0), 0);
  const cost = branches.reduce((sum: number, branch: any) => sum + (branch.totalCost || 0), 0);
  const totalProfit = Math.round(value - cost);

  if (isLoading) return <CardSkeleton />;

  return (
    <div className="bg-white rounded-xl border border-border-light shadow-soft p-6 h-full">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-brand-muted">Ganancia total</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-brand-text">{formatCurrency(totalProfit)}</p>
        </div>
        <div className="mt-0.5 p-1.5 rounded-lg bg-blue-50 text-blue-600">
          <TrendingUp className="w-4 h-4" />
        </div>
      </div>
      <p className="text-xs text-brand-muted mt-2">Total de venta − inversión (inventario)</p>
    </div>
  );
};