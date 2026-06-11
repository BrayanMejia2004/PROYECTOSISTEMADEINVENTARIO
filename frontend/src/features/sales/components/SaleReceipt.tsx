import { useEffect, useRef } from 'react';
import { Sale } from '../../../types';
import { formatCurrency } from '../../../lib/utils';
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
            className="p-2.5 rounded-lg text-brand-muted hover:text-brand-text hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable receipt */}
        <div ref={printRef} className="p-6 print:p-0">
          <style>{`
            @media print {
              @page { margin: 0; size: 80mm auto; }
              body { margin: 0; padding: 0; }
              * { box-shadow: none !important; text-shadow: none !important; }
              .receipt-print {
                width: 72mm;
                padding: 1.5mm 4mm;
                margin: 0 auto;
                font-family: 'Courier New', Courier, monospace;
                font-size: 9px;
                line-height: 1.2;
                color: #000;
                overflow-wrap: break-word;
                word-break: break-word;
              }
              .receipt-print img { max-width: 50mm; max-height: 10mm; }
            }
          `}</style>

          <div className="receipt-print">
            <div className="text-center border-b border-dashed border-gray-400 pb-2 mb-2">
              {tenant?.logo && (
                <img src={tenant.logo} alt={tenant.name} className="mx-auto mb-1" />
              )}
              <div className="font-bold text-xs uppercase">{tenant?.name || 'Mi Empresa'}</div>
              {tenant?.nit && <div className="text-[8px]">NIT: {tenant.nit}</div>}
              {tenant?.address && <div className="text-[8px]">{tenant.address}</div>}
              {tenant?.phone && <div className="text-[8px]">Tel: {tenant.phone}</div>}
            </div>

            <div className="text-[8px] mb-2">
              <div className="flex justify-between"><span>Ticket:</span><span>{sale.saleNumber}</span></div>
              <div className="flex justify-between"><span>Fecha:</span><span>{new Date(sale.createdAt).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}</span></div>
              <div className="flex justify-between"><span>Cajero:</span><span>{user?.firstName} {user?.lastName}</span></div>
            </div>

            <div className="border-t border-dashed border-gray-400 mb-1" />

            <div className="text-[8px] mb-1">
              <div className="flex justify-between font-bold mb-0.5">
                <span>Artículo</span><span>Total</span>
              </div>
              {sale.items.map((item: any, i: number) => (
                <div key={i} className="mb-0.5">
                  <div className="flex justify-between">
                    <span className="max-w-[75%] break-words">{item.productName}</span>
                    <span className="shrink-0">{formatCurrency(item.total)}</span>
                  </div>
                  <div className="text-[7px] text-gray-500">Cant: {item.quantity} x {formatCurrency(item.unitPrice)}</div>
                </div>
              ))}
            </div>

            <div className="border-t border-dashed border-gray-400 mb-1" />

            <div className="text-[8px] mb-1">
              <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(sale.subtotal)}</span></div>
              {sale.tax > 0 && <div className="flex justify-between"><span>Impuestos</span><span>{formatCurrency(sale.tax)}</span></div>}
              {sale.discount > 0 && <div className="flex justify-between text-red-600"><span>Descuento</span><span>-{formatCurrency(sale.discount)}</span></div>}
              <div className="flex justify-between font-bold text-[10px] border-t border-gray-400 pt-0.5 mt-0.5">
                <span>TOTAL</span><span>{formatCurrency(sale.total)}</span>
              </div>
            </div>

            <div className="border-t border-dashed border-gray-400 mb-1" />

            <div className="text-[8px] mb-1">
              <div className="flex justify-between"><span>Método de pago:</span><span>{paymentLabel}</span></div>
              {sale.exchangeFromSaleId && sale.exchangeCredit && (
                <>
                  <div className="flex justify-between"><span>Crédito intercambio:</span><span>{formatCurrency(sale.exchangeCredit)}</span></div>
                  {sale.total > sale.exchangeCredit && <div className="flex justify-between font-bold"><span>Pagado adicional:</span><span>{formatCurrency(sale.total - sale.exchangeCredit)}</span></div>}
                </>
              )}
              {sale.paymentMethod === 'transfer' && sale.transferBank && <div className="flex justify-between"><span>Banco:</span><span>{sale.transferBank}</span></div>}
              {sale.paymentMethod === 'transfer' && sale.transferReference && <div className="flex justify-between"><span>Ref:</span><span>{sale.transferReference}</span></div>}
              {sale.paymentMethod === 'card' && sale.cardBank && <div className="flex justify-between"><span>Banco:</span><span>{sale.cardBank}</span></div>}
              {sale.paymentMethod === 'card' && sale.cardReference && <div className="flex justify-between"><span>Ref:</span><span>{sale.cardReference}</span></div>}
              {sale.customerName && <div className="flex justify-between border-t border-gray-300 pt-0.5 mt-0.5"><span>Cliente:</span><span>{sale.customerName}</span></div>}
            </div>

            <div className="text-center text-[8px] pt-1 border-t border-dashed border-gray-400">
              <div className="font-bold text-[9px]">¡Gracias por su compra!</div>
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
