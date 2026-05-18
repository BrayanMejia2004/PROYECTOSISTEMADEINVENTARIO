import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Wallet, Lock, Filter, ShoppingCart } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useCurrentShift, useOpenShift, useCloseShift, useShifts } from '../features/sales/hooks';
import { useCartSummary } from '@/context/CartContext';
import { ShiftSummary } from '../features/sales/components/ShiftSummary';
import { ShiftCloseReceipt } from '../features/sales/components/ShiftCloseReceipt';
import { AdminShiftDetail } from '../features/sales/components/AdminShiftDetail';
import { CashMovements } from '../features/sales/components/CashMovements';
import { formatCurrency, formatNumber } from '../lib/utils';
import { NumberInput } from '../components/ui/NumberInput';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';

export const CashierShiftPage = () => {
  const { user } = useAuth();

  if (user?.role === 'cashier') {
    return <CashierSection />;
  }

  return <AdminSection />;
};

const CashierSection = () => {
  const { user, tenant } = useAuth();
  const [showOpenShift, setShowOpenShift] = useState(false);
  const [openingAmount, setOpeningAmount] = useState('');
  const [closeReceiptData, setCloseReceiptData] = useState<any>(null);
  const [confirmClose, setConfirmClose] = useState(false);

  const { data: shiftData, isLoading: shiftLoading } = useCurrentShift();
  const { mutate: openShift, isPending: isOpening } = useOpenShift();
  const { mutate: closeShift, isPending: isClosing } = useCloseShift();

  const shift = shiftData?.data;
  const isOpen = !!shift && shift.status === 'open';
  const summary = shift?.summary;

  const { cartsWithItems, totalItems } = useCartSummary();

  const badgeLink = cartsWithItems.length === 1
    ? `/pos/${cartsWithItems[0].id}`
    : cartsWithItems.length > 1
      ? `/pos/${cartsWithItems[0].id}`
      : null;

  const badgeText = cartsWithItems.length === 1
    ? `${cartsWithItems[0].name}: ${cartsWithItems[0].count} producto${cartsWithItems[0].count !== 1 ? 's' : ''}`
    : cartsWithItems.length > 1
      ? `${totalItems} productos en ${cartsWithItems.length} cajas`
      : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
          <Wallet className="w-5 h-5 text-brand" />
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-sans font-bold text-brand-text">Gestión de Caja</h1>
          <p className="text-sm text-brand-muted">Administra tu turno y movimientos de efectivo</p>
        </div>
        {badgeLink && (
          <Link
            to={badgeLink}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand/10 text-brand hover:bg-brand/20 transition-colors text-sm font-medium"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>{badgeText}</span>
          </Link>
        )}
      </div>

      {shiftLoading ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center">
          <p className="text-sm text-brand-muted">Cargando...</p>
        </div>
      ) : !isOpen ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center max-w-lg mx-auto">
          <Wallet className="w-16 h-16 text-brand-muted/30 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-brand-text mb-2">Caja Cerrada</h2>
          <p className="text-sm text-brand-muted mb-6">Debe abrir la caja antes de comenzar a operar</p>

          {!showOpenShift ? (
            <button
              onClick={() => setShowOpenShift(true)}
              className="bg-brand text-white px-6 py-2.5 rounded-xl hover:bg-brand-dark transition-colors text-sm font-semibold"
            >
              Abrir Caja
            </button>
          ) : (
            <div className="max-w-xs mx-auto space-y-3">
              <NumberInput
                value={openingAmount === '' ? '' : Number(openingAmount)}
                onChange={(v) => setOpeningAmount(v === '' ? '' : String(v))}
                min={0}
                placeholder="Monto inicial en efectivo"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-center text-lg font-semibold text-brand-text focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={() => { setShowOpenShift(false); setOpeningAmount(''); }}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-brand-muted hover:text-brand-text transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    if (openingAmount) {
                      openShift(Number(openingAmount), {
                        onSuccess: () => { setShowOpenShift(false); setOpeningAmount(''); },
                      });
                    }
                  }}
                  disabled={isOpening || !openingAmount}
                  className="flex-1 bg-brand text-white py-2.5 rounded-xl hover:bg-brand-dark transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isOpening ? 'Abriendo...' : 'Confirmar'}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          <ShiftSummary shift={shift} summary={summary} />

          <CashMovements shiftId={shift._id} />

          <div className="flex justify-end">
            <button
              onClick={() => setConfirmClose(true)}
              disabled={isClosing}
              className="flex items-center gap-2 bg-red-500 text-white px-5 py-2.5 rounded-xl hover:bg-red-600 transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Lock className="w-4 h-4" />
              {isClosing ? 'Cerrando...' : 'Cerrar Caja'}
            </button>
          </div>
        </>
      )}

      <ConfirmDialog
        open={confirmClose}
        onClose={() => setConfirmClose(false)}
        onConfirm={() => {
          closeShift(shift._id, {
            onSuccess: (res) => setCloseReceiptData(res.data),
          });
          setConfirmClose(false);
        }}
        title="Cerrar Caja"
        message="¿Estás seguro de cerrar la caja? Se generará el resumen final."
        confirmText="Cerrar Caja"
        variant="warning"
      />

      {closeReceiptData && (
        <ShiftCloseReceipt
          data={closeReceiptData}
          userName={`${user?.firstName || ''} ${user?.lastName || ''}`.trim()}
          tenantName={tenant?.name || ''}
          onClose={() => setCloseReceiptData(null)}
        />
      )}
    </div>
  );
};

const STATUS_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'open', label: 'Abiertos' },
  { value: 'closed', label: 'Cerrados' },
];

const AdminSection = () => {
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [showFilters, setShowFilters] = useState(false);
  const [selectedShift, setSelectedShift] = useState<any>(null);
  const { data: shiftsData, isLoading } = useShifts(filters);

  const shifts = shiftsData?.data || [];
  const meta = shiftsData?.meta;

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
          <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-brand" />
          </div>
          <div>
            <h1 className="text-xl font-sans font-bold text-brand-text">Historial de Cajas</h1>
            <p className="text-sm text-brand-muted">Turnos de cajeros del día</p>
          </div>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            showFilters ? 'bg-brand/10 text-brand' : 'bg-gray-100 text-brand-muted hover:text-brand-text'
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
              <select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-3 rounded-lg border border-gray-200 text-sm focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
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
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilters({})}
                className="px-4 py-2 text-sm text-brand-muted hover:text-brand-text transition-colors"
              >
                Limpiar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-brand-muted">Cargando...</div>
        ) : shifts.length === 0 ? (
          <div className="p-8 text-center text-sm text-brand-muted">No hay turnos registrados</div>
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
                {shifts.map((s: any) => (
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
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        s.status === 'open'
                          ? 'bg-green-50 text-green-600'
                          : 'bg-gray-100 text-brand-muted'
                      }`}>
                        {s.status === 'open' ? 'Abierta' : 'Cerrada'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {meta && (
        <div className="flex items-center justify-between text-sm text-brand-muted">
          <span>Mostrando {formatNumber(shifts.length)} de {formatNumber(meta.total)} turnos</span>
          <div className="flex gap-2">
            <button
              onClick={() => handleFilterChange('page', String(Math.max(1, (filters.page || 1) - 1)))}
              disabled={!filters.page || filters.page <= 1}
              className="px-3 py-1 rounded border border-gray-200 text-sm disabled:opacity-30 hover:bg-gray-50 transition-colors"
            >
              Anterior
            </button>
            <button
              onClick={() => handleFilterChange('page', String((filters.page || 1) + 1))}
              disabled={(filters.page || 1) * (filters.limit || 20) >= meta.total}
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
