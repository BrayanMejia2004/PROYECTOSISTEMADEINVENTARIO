import { useState } from 'react';
import { useOutOfStock } from '@/features/inventory/hooks';
import { useAuth } from '@/hooks/useAuth';
import { useBranches } from '@/features/settings/hooks';
import { formatNumber } from '@/lib/utils';
import { PackageX, Store, Filter } from 'lucide-react';
import { Select } from '@/components/ui/Select';

export const OutOfStockCard = () => {
  const { user } = useAuth();
  const { data: branches } = useBranches();
  const [selectedBranchId, setSelectedBranchId] = useState<string | undefined>(undefined);
  const isOwner = user?.role === 'owner';

  const queryBranchId = isOwner ? selectedBranchId : undefined;
  const { data, isLoading } = useOutOfStock(queryBranchId);

  if (isLoading) return <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6"><p className="text-sm text-brand-muted">Cargando...</p></div>;

  const items = data?.data || [];
  const count = items.length;
  const hasOutOfStock = count > 0;

  const groupedByBranch = items.reduce<Record<string, any[]>>((acc, item) => {
    const key = item.branchName || 'Sin sucursal';
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  return (
    <div className="bg-white rounded-xl border border-border-light shadow-soft p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-brand-muted">Agotados</p>
          <p className={`mt-1 text-2xl font-semibold tabular-nums ${hasOutOfStock ? 'text-stock-out' : 'text-stock-ok'}`}>
            {count}
          </p>
        </div>
        <div className={`mt-0.5 p-1.5 rounded-lg ${hasOutOfStock ? 'bg-stock-out-soft text-stock-out' : 'bg-stock-ok-soft text-stock-ok'}`}>
          <PackageX className="w-4 h-4" />
        </div>
      </div>
      <p className="text-xs text-brand-muted mt-2">
        {hasOutOfStock
          ? `${count} producto${count !== 1 ? 's' : ''} sin existencias`
          : 'Todos los productos tienen stock'}
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

      {hasOutOfStock && (
        <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
          {Object.entries(groupedByBranch).map(([branch, products]) => (
            <div key={branch}>
              <div className="flex items-center gap-1.5 text-xs font-medium text-brand-muted mb-1">
                <Store className="w-3 h-3" />
                {branch} ({formatNumber(products.length)})
              </div>
              {products.map((item: any) => (
                <div key={item._id} className="flex items-center justify-between rounded-lg bg-stock-out-soft px-2.5 py-1.5 mb-1 ml-4 text-xs">
                  <span className="text-brand-text truncate mr-2">{item.productName || item.sku || '—'}</span>
                  <span className="text-stock-out font-medium tabular-nums shrink-0">0/{formatNumber(item.minStock || 0)}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};