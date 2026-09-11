import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePermission } from '@/hooks/usePermission';
import { ProductTable } from '@/features/inventory/components/ProductTable';
import { ImportModal } from '@/features/inventory/components/ImportModal';
import { useBranches } from '@/features/settings/hooks';
import { useLowStock, useOutOfStock } from '@/features/inventory/hooks';
import { useInventorySummary } from '@/features/reports/hooks';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { useState } from 'react';
import { saveAs } from 'file-saver';
import toast from 'react-hot-toast';
import { Store, Plus, Package, Upload, Download } from 'lucide-react';
import { Select } from '@/components/ui/Select';

const Barcode = () => (
  <div className="hidden sm:flex items-end h-6 gap-[3px] rounded-sm overflow-hidden" aria-hidden>
    {[2, 1, 3, 1, 2, 3, 1, 4, 1, 2, 3, 1, 2, 1, 3, 1, 2, 1, 4, 2, 1, 2, 1, 3].map((w, i) => (
      <span key={i} className="h-full bg-brand-text/70" style={{ width: `${w}px` }} />
    ))}
  </div>
);

export const InventoryPage = () => {
  const { user } = useAuth();
  const { hasPermission } = usePermission();
  const { data: branches } = useBranches();
  const [selectedBranchId, setSelectedBranchId] = useState<string | undefined>(undefined);
  const [showImport, setShowImport] = useState(false);
  const isOwner = user?.role === 'owner';

  const activeBranchId = isOwner ? selectedBranchId : user?.branchId;
  const hasContext = isOwner ? !!selectedBranchId : !!user?.branchId;

  const { data: inv, isLoading: invLoading } = useInventorySummary(activeBranchId);
  const { data: lowData } = useLowStock(activeBranchId);
  const { data: outData } = useOutOfStock(activeBranchId);

  const branchesArr = inv?.data || [];
  const totalItems = branchesArr.reduce((sum: number, b: any) => sum + (b.totalItems || 0), 0);
  const totalCost = branchesArr.reduce((sum: number, b: any) => sum + (b.totalCost || 0), 0);
  const lowCount = (lowData?.data || []).filter((i: any) => i.quantity > 0).length;
  const outCount = (outData?.data || []).length;

  const handleExport = async () => {
    const token = localStorage.getItem('token');
    const base = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
    try {
      const res = await fetch(`${base}/products/export`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const blob = await res.blob();
      saveAs(blob, `inventario-${Date.now()}.xlsx`);
    } catch {
      toast.error('Error al exportar. Verifica la conexión e intenta de nuevo.');
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-sans font-bold text-brand-text">Inventario</h1>
          <div className="flex items-center gap-3">
            <p className="text-sm text-brand-muted mt-1">Gestiona tus productos y stock</p>
            <Barcode />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {hasPermission('inventory:create') && !isOwner && (
            <>
              <button
                onClick={() => setShowImport(true)}
                className="inline-flex items-center gap-2 bg-white text-brand-text border border-gray-200 px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                <Upload className="w-4 h-4" />
                Importar
              </button>
              <button
                onClick={handleExport}
                className="inline-flex items-center gap-2 bg-white text-brand-text border border-gray-200 px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                <Download className="w-4 h-4" />
                Exportar
              </button>
              <Link
                to="/inventory/new"
                className="inline-flex items-center gap-2 bg-brand text-white px-4 py-2.5 rounded-lg hover:bg-brand-dark transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Nuevo Producto
              </Link>
            </>
          )}
        </div>
      </div>

      {isOwner && (
        <div className="flex items-center gap-2 mb-5">
          <Store className="w-4 h-4 text-brand-muted" />
          <label className="text-sm font-medium text-brand-text">Sucursal</label>
          <Select
            value={selectedBranchId || ''}
            onChange={(e) => setSelectedBranchId(e.target.value || undefined)}
            placeholder="Seleccionar sucursal"
            options={branches?.data?.map((b: any) => ({ value: b._id, label: b.name })) || []}
            wrapperClassName="w-72"
            className="text-sm"
          />
        </div>
      )}

      {hasContext && (
        <div className="bg-white rounded-xl border border-border-light shadow-soft mb-5 overflow-hidden">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-border-light">
            <div className="flex items-stretch gap-3 px-5 py-4">
              <span className="w-1.5 rounded-full bg-brand self-stretch" />
              <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-wider text-brand-muted">Productos</p>
                <p className="mt-0.5 text-2xl font-semibold tabular-nums text-brand-text">
                  {invLoading ? '—' : formatNumber(totalItems)}
                </p>
              </div>
            </div>
            <div className="flex items-stretch gap-3 px-5 py-4">
              <span className="w-1.5 rounded-full bg-brand-light self-stretch" />
              <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-wider text-brand-muted">Valor a costo</p>
                <p className="mt-0.5 text-2xl font-semibold tabular-nums text-brand-text">
                  {invLoading ? '—' : formatCurrency(totalCost)}
                </p>
              </div>
            </div>
            <div className="flex items-stretch gap-3 px-5 py-4">
              <span className="w-1.5 rounded-full bg-stock-low self-stretch" />
              <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-wider text-brand-muted">Bajo stock</p>
                <p className={`mt-0.5 text-2xl font-semibold tabular-nums ${lowCount > 0 ? 'text-stock-low' : 'text-brand-muted'}`}>
                  {invLoading ? '—' : formatNumber(lowCount)}
                </p>
                <p className="text-xs text-brand-muted mt-0.5">por debajo del mínimo</p>
              </div>
            </div>
            <div className="flex items-stretch gap-3 px-5 py-4">
              <span className="w-1.5 rounded-full bg-stock-out self-stretch" />
              <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-wider text-brand-muted">Agotados</p>
                <p className={`mt-0.5 text-2xl font-semibold tabular-nums ${outCount > 0 ? 'text-stock-out' : 'text-brand-muted'}`}>
                  {invLoading ? '—' : formatNumber(outCount)}
                </p>
                <p className="text-xs text-brand-muted mt-0.5">sin existencias</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-border-light shadow-soft">
        <div className="p-4 border-b border-border-light flex items-center gap-2 text-sm text-brand-muted">
          <Package className="w-4 h-4" />
          Lista de productos
        </div>
        <ProductTable branchId={activeBranchId} readOnly={isOwner} />
      </div>

      {showImport && <ImportModal onClose={() => setShowImport(false)} />}
    </div>
  );
};