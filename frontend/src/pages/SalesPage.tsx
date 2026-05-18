import { useState, useCallback } from 'react';
import { useSales } from '../features/sales/hooks';
import { SalesSummaryCards } from '../features/sales/components/SalesSummaryCards';
import { SalesFilters } from '../features/sales/components/SalesFilters';
import { SaleDetail } from '../features/sales/components/SaleDetail';
import { useAuth } from '../hooks/useAuth';
import { useBranches } from '../features/settings/hooks';
import { formatCurrency, formatNumber, formatDate } from '../lib/utils';
import { Store, Receipt, Eye, ChevronLeft, ChevronRight } from 'lucide-react';

const STATUS_LABELS: Record<string, string> = {
  completed: 'Completada',
  cancelled: 'Anulada',
  refunded: 'Devuelta',
  pending: 'Pendiente',
  partial: 'Parcial',
};

const PAYMENT_LABELS: Record<string, string> = {
  cash: 'Efectivo',
  card: 'Tarjeta',
  transfer: 'Transferencia',
  exchange: 'Intercambio',
};

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    completed: 'bg-green-50 text-green-700 border-green-200',
    cancelled: 'bg-red-50 text-red-700 border-red-200',
    refunded: 'bg-orange-50 text-orange-700 border-orange-200',
    pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    partial: 'bg-blue-50 text-blue-700 border-blue-200',
  };
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || styles.pending}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );
};

export const SalesPage = () => {
  const { user } = useAuth();
  const { data: branches } = useBranches();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [selectedBranchId, setSelectedBranchId] = useState<string | undefined>(undefined);
  const limit = 15;
  const isOwner = user?.role === 'owner';

  const queryParams: Record<string, any> = { ...filters, page, limit };
  if (isOwner && selectedBranchId) queryParams.branchId = selectedBranchId;
  Object.keys(queryParams).forEach(k => { if (queryParams[k] === undefined || queryParams[k] === '') delete queryParams[k]; });

  const { data, isLoading } = useSales(queryParams);

  const meta = data?.meta;
  const totalPages = meta ? Math.ceil(meta.total / meta.limit) : 0;

  const handleFiltersChange = useCallback((newFilters: any) => {
    setFilters(newFilters);
    setPage(1);
  }, []);

  if (isLoading && !data) return <div className="text-sm text-brand-muted p-4">Cargando...</div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-sans font-bold text-brand-text">Ventas</h1>
        <p className="text-sm text-brand-muted mt-1">Historial de ventas realizadas</p>
      </div>

      <div className="space-y-4">
        {isOwner && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center gap-3">
              <Store className="w-4 h-4 text-brand-muted" />
              <label className="text-sm font-medium text-brand-text">Sucursal:</label>
              <select
                value={selectedBranchId || ''}
                onChange={(e) => { setSelectedBranchId(e.target.value || undefined); setPage(1); }}
                className="flex-1 max-w-xs px-3 py-3 rounded-lg border border-gray-200 text-sm text-brand-text focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all"
              >
                <option value="">Todas las sucursales</option>
                {branches?.data?.map((b: any) => (
                  <option key={b._id} value={b._id}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>
        )}
        <SalesSummaryCards />

        <SalesFilters filters={filters} onChange={handleFiltersChange} />

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2 text-sm text-brand-muted">
            <Receipt className="w-4 h-4" />
            Historial de ventas
            {meta && <span className="text-xs ml-auto">{formatNumber(meta.total)} registro(s)</span>}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-brand-bg">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wider">No. Venta</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wider">Fecha</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wider">Cliente</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wider">Productos</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wider">Pago</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wider">Total</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wider">Estado</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wider">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data?.data?.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-sm text-brand-muted">No se encontraron ventas</td>
                  </tr>
                ) : (
                  data?.data?.map((sale: any) => (
                    <tr key={sale._id} className="hover:bg-brand-bg/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-brand-text">{sale.saleNumber}</td>
                      <td className="px-6 py-4 text-sm text-brand-muted whitespace-nowrap">{formatDate(sale.createdAt)}</td>
                      <td className="px-6 py-4 text-sm text-brand-muted max-w-[140px] truncate">{sale.customerName || '—'}</td>
                      <td className="px-6 py-4 text-sm text-brand-muted">{sale.items?.length ?? 0}</td>
                      <td className="px-6 py-4 text-sm text-brand-muted">{PAYMENT_LABELS[sale.paymentMethod] || sale.paymentMethod}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-brand-text text-right">{formatCurrency(sale.total)}</td>
                      <td className="px-6 py-4"><StatusBadge status={sale.status} /></td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedSale(sale)}
                          className="inline-flex items-center gap-1.5 text-sm text-brand hover:text-brand-dark font-medium transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          Detalle
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100">
              <span className="text-xs text-brand-muted">
                Página {formatNumber(meta?.page)} de {formatNumber(totalPages)}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors text-brand-muted hover:text-brand-text disabled:opacity-30"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .map((p, idx, arr) => (
                    <span key={p} className="flex items-center">
                      {idx > 0 && arr[idx - 1] !== p - 1 && <span className="px-1 text-brand-muted text-xs">...</span>}
                      <button
                        onClick={() => setPage(p)}
                        className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${p === page ? 'bg-brand text-white' : 'text-brand-muted hover:bg-gray-100'}`}
                      >
                        {p}
                      </button>
                    </span>
                  ))}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors text-brand-muted hover:text-brand-text disabled:opacity-30"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedSale && (
        <SaleDetail
          sale={selectedSale}
          onClose={() => setSelectedSale(null)}
          onAction={() => {
            setSelectedSale(null);
          }}
        />
      )}
    </div>
  );
};
