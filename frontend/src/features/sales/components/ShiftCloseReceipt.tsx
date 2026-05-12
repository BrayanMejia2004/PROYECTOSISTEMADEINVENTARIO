import { useRef } from 'react';
import { formatCurrency } from '../../../lib/utils';
import { Printer, X } from 'lucide-react';

interface ShiftCloseReceiptProps {
  data: {
    openingBalance: number;
    closingBalance: number;
    totalSales: number;
    totalCash: number;
    totalCard: number;
    totalTransfer: number;
    totalProfit: number;
    totalEntries: number;
    totalExits: number;
    openedAt: string;
    closedAt: string;
  };
  userName: string;
  tenantName: string;
  onClose: () => void;
}

export const ShiftCloseReceipt = ({ data, userName, tenantName, onClose }: ShiftCloseReceiptProps) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 print:bg-white print:static">
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full mx-4 print:shadow-none print:rounded-none print:mx-0 print:max-w-none">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 print:hidden">
          <h2 className="font-semibold text-brand-text">Ticket de Cierre</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-brand-muted hover:text-brand-text hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div ref={printRef} className="p-6 print:p-4">
          <style>{`
            @media print {
              body * { visibility: hidden; }
              .print-area, .print-area * { visibility: visible; }
              .print-area { position: fixed; top: 0; left: 0; width: 80mm; padding: 4mm; }
              @page { margin: 0; size: 80mm auto; }
            }
          `}</style>

          <div className="print-area space-y-4">
            <div className="text-center border-b-2 border-dashed border-gray-300 pb-4">
              <h2 className="text-lg font-bold text-brand-text uppercase tracking-wider">CIERRE DE CAJA</h2>
              <p className="text-sm text-brand-text font-medium mt-1">{tenantName}</p>
              <p className="text-xs text-brand-muted mt-1">{formatTime(data.closedAt)}</p>
              <p className="text-xs text-brand-muted">Cajero: {userName}</p>
            </div>

            <div className="text-sm space-y-1.5">
              <div className="flex justify-between font-medium">
                <span>Monto Apertura</span>
                <span>{formatCurrency(data.openingBalance)}</span>
              </div>
            </div>

            <div className="border-t border-dashed border-gray-200 pt-3">
              <p className="text-xs font-semibold text-brand-muted uppercase tracking-wider mb-2">Ventas del Día</p>
              <div className="text-sm space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-brand-muted">Efectivo</span>
                  <span className="font-medium">{formatCurrency(data.totalCash)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-muted">Tarjeta</span>
                  <span className="font-medium">{formatCurrency(data.totalCard)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-muted">Transferencia</span>
                  <span className="font-medium">{formatCurrency(data.totalTransfer)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-1.5 font-semibold text-brand-text">
                  <span>Total Ventas</span>
                  <span>{formatCurrency(data.totalSales)}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-dashed border-gray-200 pt-3">
              <p className="text-xs font-semibold text-brand-muted uppercase tracking-wider mb-2">Movimientos</p>
              <div className="text-sm space-y-1.5">
                <div className="flex justify-between text-green-600">
                  <span>Entradas</span>
                  <span className="font-medium">+{formatCurrency(data.totalEntries)}</span>
                </div>
                <div className="flex justify-between text-red-500">
                  <span>Salidas</span>
                  <span className="font-medium">-{formatCurrency(data.totalExits)}</span>
                </div>
              </div>
            </div>

            <div className="border-t-2 border-dashed border-gray-300 pt-3">
              <p className="text-xs font-semibold text-brand-muted uppercase tracking-wider mb-2">Cálculo Final</p>
              <div className="text-sm space-y-1">
                <div className="flex justify-between text-brand-muted">
                  <span>Apertura</span>
                  <span>{formatCurrency(data.openingBalance)}</span>
                </div>
                <div className="flex justify-between text-brand-muted">
                  <span>+ Ventas Efectivo</span>
                  <span>{formatCurrency(data.totalCash)}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>+ Entradas</span>
                  <span>{formatCurrency(data.totalEntries)}</span>
                </div>
                <div className="flex justify-between text-red-500">
                  <span>- Salidas</span>
                  <span>({formatCurrency(data.totalExits)})</span>
                </div>
                <div className="flex justify-between border-t border-gray-300 pt-1.5 text-base font-bold text-brand-text">
                  <span>Total Cierre</span>
                  <span>{formatCurrency(data.closingBalance)}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-dashed border-gray-200 pt-3">
              <div className="flex justify-between text-sm font-semibold text-green-600">
                <span>Ganancia del Día</span>
                <span>{formatCurrency(data.totalProfit)}</span>
              </div>
            </div>

            <div className="border-t border-dashed border-gray-200 pt-3 text-xs text-brand-muted space-y-1">
              <div className="flex justify-between">
                <span>Abrió:</span>
                <span>{formatTime(data.openedAt)}</span>
              </div>
              <div className="flex justify-between">
                <span>Cerró:</span>
                <span>{formatTime(data.closedAt)}</span>
              </div>
            </div>

            <div className="text-center text-xs text-brand-muted pt-2 border-t border-dashed border-gray-200">
              <p>Gracias por su trabajo</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 p-4 border-t border-gray-100 print:hidden">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-200 text-brand-muted rounded-xl hover:text-brand-text hover:border-gray-300 transition-all text-sm font-medium"
          >
            Cerrar
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-brand text-white rounded-xl hover:bg-brand-dark transition-all text-sm font-semibold"
          >
            <Printer className="w-4 h-4" />
            Imprimir
          </button>
        </div>
      </div>
    </div>
  );
};
