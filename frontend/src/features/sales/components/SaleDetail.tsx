import { useState } from 'react';
import { X, Download, RotateCcw } from 'lucide-react';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { useRefundSale } from '@/features/sales/hooks';
import { getSalePdf } from '@/features/sales/api';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import toast from 'react-hot-toast';
import { saveAs } from 'file-saver';
import type { Sale, SaleItem } from '@/types';

interface SaleDetailProps {
  sale: Sale;
  onClose: () => void;
  onAction: () => void;
}

const PAYMENT_LABELS: Record<string, string> = {
  cash: 'Efectivo',
  card: 'Tarjeta',
  transfer: 'Transferencia',
  exchange: 'Intercambio',
};

const STATUS_LABELS: Record<string, string> = {
  completed: 'Completada',
  cancelled: 'Anulada',
  refunded: 'Devuelta',
  pending: 'Pendiente',
  partial: 'Parcial',
};

export const SaleDetail = ({ sale, onClose, onAction }: SaleDetailProps) => {
  const { mutate: refundSale, isPending: isRefunding } = useRefundSale();
  const [confirmRefund, setConfirmRefund] = useState(false);

  const handleRefund = () => {
    setConfirmRefund(true);
  };

  const handleDownloadPdf = async () => {
    try {
      const blob = await getSalePdf(sale._id);
      saveAs(blob, `${sale.saleNumber}.pdf`);
    } catch {
      toast.error('Error al descargar el PDF. Intenta de nuevo.');
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
          <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
            <div>
              <h3 className="text-lg font-sans font-bold text-brand-text">{sale.saleNumber}</h3>
              <p className="text-sm text-brand-muted">{formatDateTime(sale.createdAt)}</p>
            </div>
            <button onClick={onClose} className="p-2.5 rounded-lg hover:bg-gray-100 transition-colors text-brand-muted hover:text-brand-text">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-5">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs font-medium text-brand-muted uppercase tracking-wider mb-1">Cliente</p>
                <p className="text-brand-text">{sale.customerName || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-brand-muted uppercase tracking-wider mb-1">Vendedor</p>
                <p className="text-brand-text">{sale.userName || sale.userId}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-brand-muted uppercase tracking-wider mb-1">Método de Pago</p>
                <p className="text-brand-text">{PAYMENT_LABELS[sale.paymentMethod] || sale.paymentMethod}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-brand-muted uppercase tracking-wider mb-1">Estado</p>
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                  sale.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' :
                  sale.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                  sale.status === 'refunded' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                  sale.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                  'bg-blue-50 text-blue-700 border-blue-200'
                }`}>
                  {STATUS_LABELS[sale.status] || sale.status}
                </span>
              </div>
              {sale.paymentMethod === 'transfer' && (
                <>
                  <div>
                    <p className="text-xs font-medium text-brand-muted uppercase tracking-wider mb-1">Banco Origen</p>
                    <p className="text-brand-text">{sale.transferBank || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-brand-muted uppercase tracking-wider mb-1">Referencia</p>
                    <p className="text-brand-text">{sale.transferReference || '—'}</p>
                  </div>
                  {sale.transferAmount != null && (
                    <div className="col-span-2">
                      <p className="text-xs font-medium text-brand-muted uppercase tracking-wider mb-1">Monto Transferido</p>
                      <p className="text-brand-text">{formatCurrency(sale.transferAmount)}</p>
                    </div>
                  )}
                </>
              )}
              {sale.paymentMethod === 'card' && (
                <>
                  <div>
                    <p className="text-xs font-medium text-brand-muted uppercase tracking-wider mb-1">Banco o Entidad</p>
                    <p className="text-brand-text">{sale.cardBank || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-brand-muted uppercase tracking-wider mb-1">Referencia</p>
                    <p className="text-brand-text">{sale.cardReference || '—'}</p>
                  </div>
                </>
              )}
              {sale.exchangeFromSaleId && (
                <>
                  <div className="col-span-2">
                    <p className="text-xs font-medium text-brand-muted uppercase tracking-wider mb-1">Intercambio desde</p>
                    <p className="text-brand-text">
                      {sale.exchangeCredit ? `${formatCurrency(sale.exchangeCredit)} cubierto por intercambio` : '—'}
                    </p>
                  </div>
                </>
              )}
            </div>

            <div>
              <p className="text-xs font-medium text-brand-muted uppercase tracking-wider mb-2">Productos</p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-brand-bg">
                    <th className="text-left px-3 py-2 text-xs font-semibold text-brand-muted">Producto</th>
                    <th className="text-center px-3 py-2 text-xs font-semibold text-brand-muted">Cant.</th>
                    <th className="text-right px-3 py-2 text-xs font-semibold text-brand-muted">Precio</th>
                    <th className="text-right px-3 py-2 text-xs font-semibold text-brand-muted">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {sale.items?.map((item: SaleItem, i: number) => (
                    <tr key={i}>
                      <td className="px-3 py-2 text-brand-text">{item.productName}</td>
                      <td className="px-3 py-2 text-center text-brand-muted">{item.quantity}</td>
                      <td className="px-3 py-2 text-right text-brand-muted">{formatCurrency(item.unitPrice)}</td>
                      <td className="px-3 py-2 text-right font-medium text-brand-text">{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-1.5 text-sm border-t border-gray-100 pt-3">
              <div className="flex justify-between">
                <span className="text-brand-muted">Subtotal</span>
                <span className="text-brand-text">{formatCurrency(sale.subtotal)}</span>
              </div>
              {sale.discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-brand-muted">Descuento</span>
                  <span className="text-red-500">-{formatCurrency(sale.discount)}</span>
                </div>
              )}
              {sale.tax > 0 && (
                <div className="flex justify-between">
                  <span className="text-brand-muted">IVA</span>
                  <span className="text-brand-text">{formatCurrency(sale.tax)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold border-t border-gray-100 pt-1.5">
                <span className="text-brand-text">Total</span>
                <span className="text-brand-text">{formatCurrency(sale.total)}</span>
              </div>
            </div>

            {sale.status === 'completed' && (
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleRefund}
                  disabled={isRefunding}
                  className="flex items-center gap-1.5 px-4 py-3 rounded-lg border border-orange-200 text-orange-600 text-sm font-medium hover:bg-orange-50 transition-colors disabled:opacity-50"
                >
                  <RotateCcw className="w-4 h-4" />
                  {isRefunding ? 'Devolviendo...' : 'Devolver'}
                </button>
                <button
                  onClick={handleDownloadPdf}
                  className="flex items-center gap-1.5 px-4 py-3 rounded-lg border border-gray-200 text-brand-muted text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  PDF
                </button>
              </div>
            )}
          </div>
        </div>

        <ConfirmDialog
          open={confirmRefund}
          onClose={() => setConfirmRefund(false)}
          onConfirm={() => {
            refundSale(sale._id, { onSuccess: onAction });
            setConfirmRefund(false);
          }}
          title="Devolver venta"
          message={`¿Estás seguro de devolver la venta "${sale.saleNumber}"? Se devolverá el stock al inventario.`}
          confirmText="Devolver"
          variant="warning"
        />
      </div>
    </>
  );
};
