import { useEffect, useRef } from 'react';
import { Sale } from '../../../types';
import { formatCurrency, formatDateTime } from '../../../lib/utils';
import { useAuth } from '../../../hooks/useAuth';
import { X, CheckCircle, Printer } from 'lucide-react';

interface SaleReceiptProps {
  sale: Sale;
  onClose: () => void;
}

export const SaleReceipt = ({ sale, onClose }: SaleReceiptProps) => {
  const { user, tenant } = useAuth();
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  useEffect(() => {
    const handleAfterPrint = () => onClose();
    window.addEventListener('afterprint', handleAfterPrint);
    return () => window.removeEventListener('afterprint', handleAfterPrint);
  }, [onClose]);

  const paymentLabel =
    sale.paymentMethod === 'exchange' ? 'Intercambio'
    : sale.paymentMethod === 'cash' ? 'Efectivo'
    : sale.paymentMethod === 'card' ? 'Tarjeta'
    : 'Transferencia';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 print:bg-white print:static">
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full mx-4 print:shadow-none print:rounded-none print:mx-0 print:max-w-none">
        {/* Header - hidden on print */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-sans font-semibold text-brand-text">Venta Exitosa</h3>
              <p className="text-xs text-brand-muted">{sale.saleNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-brand-muted hover:text-brand-text hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable receipt */}
        <div ref={printRef} className="p-6 print:p-0">
          <style>{`
            @media print {
              body * { visibility: hidden; }
              .receipt-print, .receipt-print * { visibility: visible; }
              .receipt-print {
                position: fixed;
                top: 0;
                left: 0;
                width: 80mm;
                padding: 3mm 4mm;
                font-family: 'Courier New', Courier, monospace;
                font-size: 10px;
                line-height: 1.35;
                color: #000;
              }
              @page { margin: 0; size: 80mm auto; }
            }
          `}</style>

          <div className="receipt-print space-y-3">
            {/* Business header */}
            <div className="text-center border-b-2 border-dashed border-gray-300 pb-3">
              <p className="text-sm font-bold uppercase tracking-wider">{tenant?.name || 'Mi Empresa'}</p>
              {tenant?.nit && <p className="text-[10px] mt-0.5">NIT: {tenant.nit}</p>}
              {tenant?.address && <p className="text-[10px]">{tenant.address}</p>}
              {tenant?.phone && <p className="text-[10px]">Tel: {tenant.phone}</p>}
            </div>

            {/* Ticket metadata */}
            <div className="text-[10px] space-y-0.5">
              <div className="flex justify-between">
                <span>Ticket:</span>
                <span>{sale.saleNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Fecha:</span>
                <span>{formatDateTime(sale.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span>Cajero:</span>
                <span>{user?.firstName} {user?.lastName}</span>
              </div>
            </div>

            <div className="border-t border-dashed border-gray-400" />

            {/* Items */}
            <div className="text-[10px]">
              <div className="flex justify-between font-bold mb-1">
                <span>Artículo</span>
                <span>Total</span>
              </div>
              {sale.items.map((item: any, index: number) => (
                <div key={index} className="mb-1.5">
                  <div className="flex justify-between">
                    <span className="flex-1 truncate">{item.productName}</span>
                    <span className="text-right">{formatCurrency(item.total)}</span>
                  </div>
                  <div className="text-[9px] text-gray-500">
                    Cant: {item.quantity} x {formatCurrency(item.unitPrice)}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-dashed border-gray-400" />

            {/* Totals */}
            <div className="text-[10px] space-y-0.5">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(sale.subtotal)}</span>
              </div>
              {sale.tax > 0 && (
                <div className="flex justify-between">
                  <span>Impuestos</span>
                  <span>{formatCurrency(sale.tax)}</span>
                </div>
              )}
              {sale.discount > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Descuento</span>
                  <span>-{formatCurrency(sale.discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-sm border-t border-gray-400 pt-1 mt-1">
                <span>TOTAL</span>
                <span>{formatCurrency(sale.total)}</span>
              </div>
            </div>

            <div className="border-t border-dashed border-gray-400" />

            {/* Payment details */}
            <div className="text-[10px] space-y-0.5">
              <div className="flex justify-between">
                <span>Método de pago:</span>
                <span>{paymentLabel}</span>
              </div>
              {sale.exchangeFromSaleId && sale.exchangeCredit ? (
                <>
                  <div className="flex justify-between">
                    <span>Crédito intercambio:</span>
                    <span>{formatCurrency(sale.exchangeCredit)}</span>
                  </div>
                  {sale.total > sale.exchangeCredit && (
                    <div className="flex justify-between font-bold">
                      <span>Pagado adicional:</span>
                      <span>{formatCurrency(sale.total - sale.exchangeCredit)}</span>
                    </div>
                  )}
                </>
              ) : null}
              {sale.paymentMethod === 'transfer' && sale.transferBank && (
                <div className="flex justify-between">
                  <span>Banco origen:</span>
                  <span>{sale.transferBank}</span>
                </div>
              )}
              {sale.paymentMethod === 'transfer' && sale.transferReference && (
                <div className="flex justify-between">
                  <span>Referencia:</span>
                  <span>{sale.transferReference}</span>
                </div>
              )}
              {sale.paymentMethod === 'card' && sale.cardBank && (
                <div className="flex justify-between">
                  <span>Banco:</span>
                  <span>{sale.cardBank}</span>
                </div>
              )}
              {sale.paymentMethod === 'card' && sale.cardReference && (
                <div className="flex justify-between">
                  <span>Referencia:</span>
                  <span>{sale.cardReference}</span>
                </div>
              )}
              {sale.customerName && (
                <div className="flex justify-between pt-1 border-t border-gray-200">
                  <span>Cliente:</span>
                  <span>{sale.customerName}</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="text-center text-[10px] pt-2 border-t border-dashed border-gray-300">
              <p className="font-bold text-xs">¡Gracias por su compra!</p>
            </div>
          </div>
        </div>

        {/* Buttons - hidden on print */}
        <div className="flex gap-2 p-4 border-t border-gray-100 print:hidden">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 border-2 border-brand text-brand py-2.5 rounded-xl hover:bg-brand/5 transition-colors text-sm font-semibold"
          >
            <Printer className="w-4 h-4" />
            Imprimir
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-brand text-white py-2.5 rounded-xl hover:bg-brand-dark transition-colors text-sm font-semibold"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
