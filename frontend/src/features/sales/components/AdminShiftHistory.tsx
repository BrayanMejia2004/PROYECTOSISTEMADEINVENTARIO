import { useState } from 'react';
import { Wallet, Filter, RotateCcw } from 'lucide-react';
import { useShifts } from '@/features/sales/hooks';
import { AdminShiftDetail } from '@/features/sales/components/AdminShiftDetail';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { TableSkeleton } from '@/components/ui/TableSkeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import type { CashierShift } from '@/types';

const STATUS_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'open', label: 'Abiertos' },
  { value: 'closed', label: 'Cerrados' },
];

export const AdminShiftHistory = () => {
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [showFilters, setShowFilters] = useState(false);
  const [selectedShift, setSelectedShift] = useState<CashierShift | null>(null);
  const { data: shiftsData, isLoading, isError, error, refetch } = useShifts(filters);

  const shifts = shiftsData?.data || [];
  const meta = shiftsData?.meta;
  const hasFilters = Object.entries(filters).some(([k, v]) => k !== 'page' && v);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => {
      const next = { ...prev };
      if (value) {
        next[key] = value;
      } else {
        delete next[key];
      }
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-sans font-bold text-brand-text">Historial de Cajas</h1>
            <p className="text-sm text-brand-muted">Turnos de cajeros del día</p>
          </div>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${showFilters ? 'bg-brand/10 text-brand' : 'bg-gray-100 text-brand-muted hover:text-brand-text'
            }`}
        >
          <Filter className="w-4 h-4" />
          Filtros
        </button>
      </div>

      {showFilters && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-brand-muted mb-1.5">Estado</label>
              <Select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                options={STATUS_OPTIONS.filter(o => o.value !== '').map(o => ({ value: o.value, label: o.label }))}
                placeholder="Todos"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-brand-muted mb-1.5">Desde</label>
              <input
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full px-3 py-3 rounded-lg border border-gray-200 text-sm focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-brand-muted mb-1.5">Hasta</label>
              <input
                type="date"
                value={filters.endDate || ''}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full px-3 py-3 rounded-lg border border-gray-200 text-sm focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none"
              />
              {filters.startDate && filters.endDate && filters.startDate > filters.endDate && (
                <p className="text-red-500 text-xs mt-1">La fecha de inicio debe ser anterior a la fecha fin</p>
              )}
            </div>
            <div className="flex items-end justify-end">
              {hasFilters && (
                <button
                  onClick={() => setFilters({})}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-brand-muted hover:text-red-500 hover:border-red-200 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Limpiar
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <TableSkeleton rows={5} columns={11} />
      ) : isError ? (
        <ErrorState message={(error as Error)?.message} onRetry={() => refetch()} />
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {shifts.length === 0 ? (
            <EmptyState icon={Wallet} title="Sin turnos registrados" description="No hay turnos de caja en el período seleccionado" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wider">Cajero</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wider">Sucursal</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wider">Apertura</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wider">Hora Apertura</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wider">Cierre</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wider">Hora Cierre</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wider">Entradas</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wider">Salidas</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wider">Ventas</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wider">Ganancia</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wider">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {shifts.map((s: CashierShift) => (
                    <tr
                      key={s._id}
                      onClick={() => setSelectedShift(s)}
                      className="hover:bg-brand/5 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-3 text-sm font-medium text-brand underline underline-offset-2 decoration-brand/30 hover:decoration-brand">
                        {s.userName || '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-brand-muted">{s.branchName || '—'}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-brand-text text-right">{formatCurrency(s.openingBalance)}</td>
                      <td className="px-4 py-3 text-sm text-brand-muted">
                        {s.openedAt ? new Date(s.openedAt).toLocaleTimeString() : '—'}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-brand-text text-right">
                        {s.closingBalance != null ? formatCurrency(s.closingBalance) : '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-brand-muted">
                        {s.closedAt ? new Date(s.closedAt).toLocaleTimeString() : '—'}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-green-600 text-right">{formatCurrency(s.totalEntries || 0)}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-red-500 text-right">{formatCurrency(s.totalExits || 0)}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-brand-text text-right">{formatCurrency(s.totalSales)}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-green-600 text-right">{formatCurrency(s.totalProfit)}</td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant={s.status === 'open' ? 'success' : 'neutral'}>
                          {s.status === 'open' ? 'Abierta' : 'Cerrada'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {meta && (
        <div className="flex items-center justify-between text-sm text-brand-muted">
          <span>Mostrando {formatNumber(shifts.length)} de {formatNumber(meta.total)} turnos</span>
          <div className="flex gap-2">
            <button
              onClick={() => handleFilterChange('page', String(Math.max(1, (Number(filters.page) || 1) - 1)))}
              disabled={!filters.page || Number(filters.page) <= 1}
              className="px-3 py-1 rounded border border-gray-200 text-sm disabled:opacity-30 hover:bg-gray-50 transition-colors"
            >
              Anterior
            </button>
            <button
              onClick={() => handleFilterChange('page', String((Number(filters.page) || 1) + 1))}
              disabled={(Number(filters.page) || 1) * (Number(filters.limit) || 20) >= meta.total}
              className="px-3 py-1 rounded border border-gray-200 text-sm disabled:opacity-30 hover:bg-gray-50 transition-colors"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {selectedShift && (
        <AdminShiftDetail shift={selectedShift} onClose={() => setSelectedShift(null)} />
      )}
    </div>
  );
};
