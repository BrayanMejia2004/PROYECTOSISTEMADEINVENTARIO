import { Wallet, X, ArrowDownRight, ArrowUpRight, Loader2 } from 'lucide-react';
import { useMovements } from '../hooks';
import { formatCurrency } from '../../../lib/utils';

interface AdminShiftDetailProps {
  shift: any;
  onClose: () => void;
}

export const AdminShiftDetail = ({ shift, onClose }: AdminShiftDetailProps) => {
  const { data: movementsData, isLoading } = useMovements(shift._id);
  const movements = movementsData?.data || [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 pb-8 bg-black/40 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-brand" />
            </div>
            <div>
              <h2 className="text-lg font-sans font-bold text-brand-text">Detalle del Turno</h2>
              <p className="text-sm text-brand-muted">{shift.userName || 'Cajero'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-brand-muted hover:text-brand-text hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-xs text-brand-muted mb-1">Apertura</p>
              <p className="text-lg font-bold text-brand-text">{formatCurrency(shift.openingBalance)}</p>
              <p className="text-xs text-brand-muted mt-0.5">
                {shift.openedAt ? new Date(shift.openedAt).toLocaleTimeString() : '—'}
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-xs text-brand-muted mb-1">Cierre</p>
              <p className="text-lg font-bold text-brand-text">
                {shift.closingBalance != null ? formatCurrency(shift.closingBalance) : '—'}
              </p>
              <p className="text-xs text-brand-muted mt-0.5">
                {shift.closedAt ? new Date(shift.closedAt).toLocaleTimeString() : '—'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-xs text-brand-muted mb-1">Ventas</p>
              <p className="text-lg font-bold text-brand-text">{formatCurrency(shift.totalSales)}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-xs text-brand-muted mb-1">Ganancia</p>
              <p className="text-lg font-bold text-green-600">{formatCurrency(shift.totalProfit)}</p>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-brand-text">Movimientos de Efectivo</p>
              <div className="flex gap-4 text-xs">
                <span className="flex items-center gap-1 text-green-600">
                  <ArrowDownRight className="w-3.5 h-3.5" />
                  Entradas: {formatCurrency(shift.totalEntries || 0)}
                </span>
                <span className="flex items-center gap-1 text-red-500">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  Salidas: {formatCurrency(shift.totalExits || 0)}
                </span>
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 text-brand animate-spin" />
              </div>
            ) : movements.length === 0 ? (
              <div className="text-center py-6 bg-gray-50 rounded-xl">
                <p className="text-sm text-brand-muted">No hubo movimientos en este turno</p>
              </div>
            ) : (
              <div className="space-y-2">
                {movements.map((m: any) => (
                  <div
                    key={m._id}
                    className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        m.type === 'entry' ? 'bg-green-50' : 'bg-red-50'
                      }`}>
                        {m.type === 'entry' ? (
                          <ArrowDownRight className="w-4 h-4 text-green-600" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-brand-text">{m.reason}</p>
                        <p className="text-xs text-brand-muted">
                          {new Date(m.createdAt).toLocaleTimeString()}
                          {m.userName ? ` — ${m.userName}` : ''}
                        </p>
                      </div>
                    </div>
                    <span className={`text-sm font-bold ${
                      m.type === 'entry' ? 'text-green-600' : 'text-red-500'
                    }`}>
                      {m.type === 'entry' ? '+' : '-'}{formatCurrency(m.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex p-5 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 border border-gray-200 text-brand-muted rounded-xl hover:text-brand-text hover:border-gray-300 transition-all text-sm font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
