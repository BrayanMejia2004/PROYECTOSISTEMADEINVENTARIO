import { useInventorySummary } from '@/features/reports/hooks';
import { formatNumber } from '@/lib/utils';
import { Boxes } from 'lucide-react';
import { CardSkeleton } from '@/components/ui/CardSkeleton';

export const ProductosCard = () => {
  const { data, isLoading } = useInventorySummary();
  const branches = data?.data ?? [];
  const totalItems = branches.reduce((sum: number, branch: any) => sum + (branch.totalItems || 0), 0);

  if (isLoading) return <CardSkeleton />;

  return (
    <div className="bg-white rounded-xl border border-border-light shadow-soft p-6 h-full">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-brand-muted">Productos</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-brand-text">{formatNumber(totalItems)}</p>
        </div>
        <div className="mt-0.5 p-1.5 rounded-lg bg-stock-move-soft text-stock-move">
          <Boxes className="w-4 h-4" />
        </div>
      </div>
      <p className="text-xs text-brand-muted mt-2">Productos en total</p>
    </div>
  );
};