import { useState } from 'react';
import { useProducts, useDeleteProduct } from '../hooks';
import { Product } from '../../../types';
import { useNavigate } from 'react-router-dom';
import { usePermission } from '../../../hooks/usePermission';
import { formatCurrency } from '../../../lib/utils';
import { Pencil, Trash2, Package, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { SuccessToast } from '../../../components/ui/SuccessToast';

const PAGE_SIZE = 10;

const UNIT_LABELS: Record<string, string> = {
  unit: 'Unidad',
  kg: 'Kg',
  g: 'Gramo',
  l: 'Litro',
  ml: 'Ml',
  box: 'Caja',
  pack: 'Paquete',
};

export const ProductTable = ({ branchId }: { branchId?: string }) => {
  const [page, setPage] = useState(1);
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id?: string }>({ open: false });
  const [showSuccess, setShowSuccess] = useState(false);
  const { data, isLoading } = useProducts({ page, limit: PAGE_SIZE, branchId });
  const noBranchSelected = branchId === undefined;
  const { mutate: deleteProduct } = useDeleteProduct();
  const navigate = useNavigate();
  const { hasPermission } = usePermission();

  const products = data?.data || [];
  const meta = data?.meta;

  const columns = [
    { key: 'sku', label: 'Código', className: 'font-mono text-xs text-brand-muted' },
    { key: 'name', label: 'Nombre', className: 'font-medium text-brand-text' },
    {
      key: 'departmentName',
      label: 'Departamento',
      render: (p: Product) => (
        <span className="text-brand-muted">{p.departmentName || '—'}</span>
      ),
    },
    {
      key: 'stock',
      label: 'Stock',
      render: (p: Product) => (
        <span className={`font-semibold text-sm ${(p.stock ?? 0) > 0 ? 'text-brand' : 'text-brand-muted'}`}>
          {p.stock ?? 0}
        </span>
      ),
    },
    {
      key: 'unit',
      label: 'Tipo',
      render: (p: Product) => (
        <span className="text-brand-muted text-xs">{UNIT_LABELS[p.unit] || p.unit}</span>
      ),
    },
    {
      key: 'costPrice',
      label: 'Costo',
      render: (p: Product) => (
        <span className="text-brand-muted">{formatCurrency(p.costPrice)}</span>
      ),
    },
    {
      key: 'profit',
      label: 'Ganancia',
      render: (p: Product) => {
        if (p.price <= p.costPrice) return <span className="text-brand-muted">—</span>;
        const percent = ((1 - p.costPrice / p.price) * 100).toFixed(1);
        return <span className="font-medium text-green-600">{percent}%</span>;
      },
    },
    {
      key: 'price',
      label: 'Precio',
      render: (p: Product) => (
        <span className="font-semibold text-brand-text">{formatCurrency(p.price)}</span>
      ),
    },
    {
      key: 'wholesalePrice',
      label: 'Precio Mayor',
      render: (p: Product) => (
        <span className="text-brand-muted">
          {p.wholesalePrice ? formatCurrency(p.wholesalePrice) : '—'}
        </span>
      ),
    },
  ];

  if (noBranchSelected) {
    return (
      <div className="p-12 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center mb-3">
          <Package className="w-6 h-6 text-brand" />
        </div>
        <p className="text-sm font-medium text-brand-text mb-1">Selecciona una sucursal</p>
        <p className="text-xs text-brand-muted">Elige una sucursal para ver su inventario</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 text-brand animate-spin" />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="p-12 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center mb-3">
          <Package className="w-6 h-6 text-brand" />
        </div>
        <p className="text-sm font-medium text-brand-text mb-1">Sin productos</p>
        <p className="text-xs text-brand-muted">No hay productos con stock en esta sucursal</p>
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-brand-bg/50">
              {columns.map((col) => (
                <th key={col.key} className="text-left px-4 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wider whitespace-nowrap">
                  {col.label}
                </th>
              ))}
              <th className="text-right px-4 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wider whitespace-nowrap">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-brand-bg/30 transition-colors">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3.5 text-sm whitespace-nowrap">
                    {col.render ? col.render(product) : (
                      <span className={col.className || 'text-brand-text'}>
                        {(product as any)[col.key] ?? '—'}
                      </span>
                    )}
                  </td>
                ))}
                <td className="px-4 py-3.5 text-sm text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1">
                    {hasPermission('inventory:update') && (
                      <button
                        onClick={() => navigate(`/inventory/${product.id}/edit`)}
                        className="p-1.5 rounded-lg text-brand-muted hover:text-brand hover:bg-brand/10 transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    )}
                    {hasPermission('inventory:delete') && (
                      <button
                        onClick={() => setConfirmDelete({ open: true, id: product.id })}
                        className="p-1.5 rounded-lg text-brand-muted hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
          <p className="text-xs text-brand-muted">
            {meta.total} producto(s) — Página {meta.page} de {meta.totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={meta.page <= 1}
              className="p-1.5 rounded-lg text-brand-muted hover:text-brand hover:bg-brand/5 transition-colors disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
              disabled={meta.page >= meta.totalPages}
              className="p-1.5 rounded-lg text-brand-muted hover:text-brand hover:bg-brand/5 transition-colors disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false })}
        onConfirm={() => {
          if (confirmDelete.id) {
            deleteProduct(confirmDelete.id, { onSuccess: () => setShowSuccess(true) });
          }
          setConfirmDelete({ open: false });
        }}
        title="Eliminar producto"
        message="¿Estás seguro de eliminar este producto? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        variant="danger"
      />

      <SuccessToast
        open={showSuccess}
        onClose={() => setShowSuccess(false)}
        message="Producto eliminado exitosamente"
      />
    </div>
  );
};
