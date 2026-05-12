import { Banknote, CreditCard, Building2, TrendingUp, Package } from 'lucide-react';
import { formatCurrency } from '../../../lib/utils';

interface ShiftSummaryProps {
  shift: any;
  summary: any;
}

export const ShiftSummary = ({ shift, summary }: ShiftSummaryProps) => {
  const margin = summary.totalRevenue > 0
    ? ((summary.totalProfit / summary.totalRevenue) * 100).toFixed(1)
    : '0.0';

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs font-medium text-brand-muted uppercase tracking-wider mb-3">Dinero en Caja</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-brand-muted">Apertura</span>
              <span className="font-semibold text-brand-text">{formatCurrency(shift.openingBalance)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-muted">Ventas efectivo</span>
              <span className="font-semibold text-brand-text">{formatCurrency(summary.cashTotal)}</span>
            </div>
            <div className="flex justify-between text-green-600">
              <span>Entradas</span>
              <span className="font-semibold">+{formatCurrency(shift.totalEntries)}</span>
            </div>
            <div className="flex justify-between text-red-500">
              <span>Salidas</span>
              <span className="font-semibold">-{formatCurrency(shift.totalExits)}</span>
            </div>
            <div className="border-t border-gray-100 pt-2 flex justify-between">
              <span className="font-semibold text-brand-text">Total</span>
              <span className="font-bold text-lg text-brand">{formatCurrency(shift.currentTotal)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs font-medium text-brand-muted uppercase tracking-wider mb-3">Ventas del Día</p>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                  <Banknote className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-sm text-brand-text">Efectivo</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-brand-text">{formatCurrency(summary.cashTotal)}</p>
                <p className="text-xs text-brand-muted">{summary.cashCount} venta(s)</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-sm text-brand-text">Tarjeta</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-brand-text">{formatCurrency(summary.cardTotal)}</p>
                <p className="text-xs text-brand-muted">{summary.cardCount} venta(s)</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-purple-600" />
                </div>
                <span className="text-sm text-brand-text">Transferencia</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-brand-text">{formatCurrency(summary.transferTotal)}</p>
                <p className="text-xs text-brand-muted">{summary.transferCount} venta(s)</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs font-medium text-brand-muted uppercase tracking-wider mb-3">Ganancias</p>
          <div className="flex items-center justify-between mb-3">
            <p className="text-2xl font-sans font-bold text-green-600">{formatCurrency(summary.totalProfit)}</p>
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-brand-muted">Ingresos</span>
              <span className="font-medium text-brand-text">{formatCurrency(summary.totalRevenue)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-muted">Costos</span>
              <span className="font-medium text-brand-text">{formatCurrency(summary.totalCost)}</span>
            </div>
            <div className="flex justify-between border-t border-gray-100 pt-1.5">
              <span className="text-brand-muted">Margen</span>
              <span className="font-semibold text-brand-text">{margin}%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs font-medium text-brand-muted uppercase tracking-wider mb-3">Resumen</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-brand-muted">Ventas hoy</span>
              <span className="font-semibold text-brand-text">{summary.salesToday}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-muted">Productos vendidos</span>
              <span className="font-semibold text-brand-text">{summary.totalProductsSold}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-muted">Ticket promedio</span>
              <span className="font-semibold text-brand-text">{formatCurrency(summary.avgTicket)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-muted">Canceladas</span>
              <span className="font-semibold text-red-500">{summary.cancelledCount}</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-gray-100 text-xs text-brand-muted">
              <Package className="w-3 h-3" />
              Caja abierta {new Date(shift.openedAt).toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
