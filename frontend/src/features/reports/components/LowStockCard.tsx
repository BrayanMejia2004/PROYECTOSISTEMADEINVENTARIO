import { useState } from 'react';
import { useLowStock } from '@/features/inventory/hooks';
import { useAuth } from '@/hooks/useAuth';
import { useBranches } from '@/features/settings/hooks';
import { AlertTriangle, Package, Filter } from 'lucide-react';
import { Select } from '@/components/ui/Select';
import { formatNumber } from '@/lib/utils';

export const LowStockCard = () => {
  const { user } = useAuth();
  const { data: branches } = useBranches();
  const [selectedBranchId, setSelectedBranchId] = useState<string | undefined>(undefined);
  const isOwner = user?.role === 'owner';

  const queryBranchId = isOwner ? selectedBranchId : undefined;
  const { data, isLoading } = useLowStock(queryBranchId);

  const allItems = data?.data || [];
  const items = allItems.filter((item: any) => item.quantity > 0);

  if (isLoading) return <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6"><p className="text-sm text-brand-muted">Cargando...</p></div>;

  const count = items.length;
  const hasLowStock = count > 0;

  return (
    <div className="bg-white rounded-xl border border-border-light shadow-soft p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-brand-muted">Bajo stock</p>
          <p className={`mt-1 text-2xl font-semibold tabular-nums ${hasLowStock ? 'text-stock-low' : 'text-stock-ok'}`}>
            {count}
          </p>
        </div>
        <div className={`mt-0.5 p-1.5 rounded-lg ${hasLowStock ? 'bg-stock-low-soft text-stock-low' : 'bg-stock-ok-soft text-stock-ok'}`}>
          {hasLowStock ? <AlertTriangle className="w-4 h-4" /> : <Package className="w-4 h-4" />}
        </div>
      </div>
      <p className="text-xs text-brand-muted mt-2">
        {hasLowStock
          ? 'por debajo del stock mínimo'
          : 'Todos los productos tienen stock suficiente'}
      </p>

      {isOwner && (
        <div className="mt-3 flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-brand-muted shrink-0" />
          <Select
            value={selectedBranchId || ''}
            onChange={(e) => setSelectedBranchId(e.target.value || undefined)}
            placeholder="Todas las sucursales"
            options={branches?.data?.map((b: any) => ({ value: b._id, label: b.name })) || []}
            className="text-xs"
            wrapperClassName="flex-1"
          />
        </div>
      )}

      {hasLowStock && (
        <div className="mt-3 space-y-1.5 max-h-32 overflow-y-auto">
          {items.slice(0, 5).map((item: any) => (
            <div key={item._id} className="flex items-center justify-between rounded-lg bg-stock-low-soft px-2.5 py-1.5 text-xs">
              <span className="text-brand-text truncate mr-2">{item.productName || item.sku || '—'}</span>
              <span className="text-stock-low font-medium tabular-nums shrink-0">{formatNumber(item.quantity)} / {formatNumber(item.minStock || 0)}</span>
            </div>
          ))}
          {count > 5 && (
            <p className="text-xs text-brand-muted text-center pt-1">+{formatNumber(count - 5)} más</p>
          )}
        </div>
      )}
    </div>
  );
};