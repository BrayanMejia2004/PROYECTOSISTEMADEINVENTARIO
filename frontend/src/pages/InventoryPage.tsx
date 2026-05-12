import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { usePermission } from '../hooks/usePermission';
import { ProductTable } from '../features/inventory/components/ProductTable';
import { ImportModal } from '../features/inventory/components/ImportModal';
import { useBranches } from '../features/settings/hooks';
import { useState } from 'react';
import { saveAs } from 'file-saver';
import { Store, Plus, Package, Upload, Download } from 'lucide-react';

export const InventoryPage = () => {
  const { user } = useAuth();
  const { hasPermission } = usePermission();
  const { data: branches } = useBranches();
  const [selectedBranchId, setSelectedBranchId] = useState<string | undefined>(undefined);
  const [showImport, setShowImport] = useState(false);
  const isOwner = user?.role === 'owner';

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
      // silent
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-sans font-bold text-brand-text">Inventario</h1>
          <p className="text-sm text-brand-muted mt-1">Gestiona tus productos y stock</p>
        </div>
        <div className="flex items-center gap-2">
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
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-4">
          <div className="flex items-center gap-3">
            <Store className="w-4 h-4 text-brand-muted" />
            <label className="text-sm font-medium text-brand-text">Sucursal:</label>
            <select
              value={selectedBranchId || ''}
              onChange={(e) => setSelectedBranchId(e.target.value || undefined)}
              className="flex-1 max-w-xs px-3 py-2 rounded-lg border border-gray-200 text-sm text-brand-text focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all"
            >
              <option value="">Seleccionar sucursal</option>
              {branches?.data?.map((b: any) => (
                <option key={b._id} value={b._id}>{b.name}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="p-4 border-b border-gray-100 flex items-center gap-2 text-sm text-brand-muted">
          <Package className="w-4 h-4" />
          Lista de productos
        </div>
        <ProductTable branchId={isOwner ? selectedBranchId : user?.branchId} />
      </div>

      {showImport && <ImportModal onClose={() => setShowImport(false)} />}
    </div>
  );
};
