import { useState } from 'react';
import { Filter, X, Search } from 'lucide-react';
import { useUsers } from '../../users/hooks';
import { NumberInput } from '../../../components/ui/NumberInput';

interface SalesFiltersProps {
  filters: {
    search?: string;
    status?: string;
    paymentMethod?: string;
    customerName?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
    minTotal?: number;
    maxTotal?: number;
  };
  onChange: (filters: any) => void;
}

export const SalesFilters = ({ filters, onChange }: SalesFiltersProps) => {
  const [open, setOpen] = useState(false);
  const { data: users } = useUsers();
  const hasFilters = Object.values(filters).some(v => v !== undefined && v !== '');

  const clear = () => {
    onChange({
      search: '',
      status: '',
      paymentMethod: '',
      customerName: '',
      userId: '',
      startDate: '',
      endDate: '',
      minTotal: '',
      maxTotal: '',
    });
  };

  const update = (key: string, value: any) => {
    onChange({ ...filters, [key]: value || undefined });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
      <div className="flex items-center gap-2 px-4 py-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
          <input
            value={filters.search || ''}
            onChange={(e) => update('search', e.target.value)}
            placeholder="Buscar por número o cliente..."
            className="w-full pl-9 pr-4 py-3 rounded-lg border border-gray-200 text-sm text-brand-text focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all"
          />
        </div>
        <button
          onClick={() => setOpen(!open)}
          className={`p-2.5 rounded-lg border transition-colors text-sm ${open ? 'bg-brand text-white border-brand' : 'border-gray-200 text-brand-muted hover:text-brand-text'}`}
          title="Filtros"
        >
          <Filter className="w-4 h-4" />
        </button>
        {hasFilters && (
          <button onClick={clear} className="p-2.5 rounded-lg border border-gray-200 text-brand-muted hover:text-red-500 transition-colors text-sm" title="Limpiar filtros">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      {open && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-brand-muted mb-1">Estado</label>
              <select
                value={filters.status || ''}
                onChange={(e) => update('status', e.target.value)}
                className="w-full px-3 py-3 rounded-lg border border-gray-200 text-sm text-brand-text focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all"
              >
                <option value="">Todos</option>
                <option value="completed">Completada</option>
                <option value="refunded">Devuelta</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-brand-muted mb-1">Método de Pago</label>
              <select
                value={filters.paymentMethod || ''}
                onChange={(e) => update('paymentMethod', e.target.value)}
                className="w-full px-3 py-3 rounded-lg border border-gray-200 text-sm text-brand-text focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all"
              >
                <option value="">Todos</option>
                <option value="cash">Efectivo</option>
                <option value="card">Tarjeta</option>
                <option value="transfer">Transferencia</option>
                <option value="exchange">Intercambio</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-brand-muted mb-1">Vendedor</label>
              <select
                value={filters.userId || ''}
                onChange={(e) => update('userId', e.target.value)}
                className="w-full px-3 py-3 rounded-lg border border-gray-200 text-sm text-brand-text focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all"
              >
                <option value="">Todos</option>
                {users?.data?.map((u: any) => (
                  <option key={u._id} value={u._id}>{u.firstName} {u.lastName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-brand-muted mb-1">Cliente</label>
              <input
                value={filters.customerName || ''}
                onChange={(e) => update('customerName', e.target.value)}
                placeholder="Nombre del cliente"
                className="w-full px-3 py-3 rounded-lg border border-gray-200 text-sm text-brand-text focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-brand-muted mb-1">Fecha Inicio</label>
              <input
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => update('startDate', e.target.value)}
                className="w-full px-3 py-3 rounded-lg border border-gray-200 text-sm text-brand-text focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-brand-muted mb-1">Fecha Fin</label>
              <input
                type="date"
                value={filters.endDate || ''}
                onChange={(e) => update('endDate', e.target.value)}
                className="w-full px-3 py-3 rounded-lg border border-gray-200 text-sm text-brand-text focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all"
              />
              {filters.startDate && filters.endDate && filters.startDate > filters.endDate && (
                <p className="text-red-500 text-xs mt-1">La fecha de inicio debe ser anterior a la fecha fin</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-brand-muted mb-1">Monto Mín</label>
              <NumberInput
                value={filters.minTotal ?? ''}
                onChange={(v) => update('minTotal', v === '' ? undefined : v)}
                min={0}
                placeholder="0"
                className="w-full px-3 py-3 rounded-lg border border-gray-200 text-sm text-brand-text focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-brand-muted mb-1">Monto Máx</label>
              <NumberInput
                value={filters.maxTotal ?? ''}
                onChange={(v) => update('maxTotal', v === '' ? undefined : v)}
                min={0}
                placeholder="999999"
                className="w-full px-3 py-3 rounded-lg border border-gray-200 text-sm text-brand-text focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
