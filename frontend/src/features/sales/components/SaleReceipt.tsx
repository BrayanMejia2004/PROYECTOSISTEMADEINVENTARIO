import { Sale } from '../../../types';
import { formatCurrency, formatDateTime } from '../../../lib/utils';
import { useAuth } from '../../../hooks/useAuth';
import { X, CheckCircle, Store, Printer, User } from 'lucide-react';

interface SaleReceiptProps {
  sale: Sale;
  onClose: () => void;
}

export const SaleReceipt = ({ sale, onClose }: SaleReceiptProps) => {
  const { user, tenant } = useAuth();
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
        <div className="flex items-center justify-between mb-6">
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

        <div className="ticket-content">
          <div className="text-center mb-6">
            <div className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center mx-auto mb-2">
              <Store className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm font-bold text-brand-text">{tenant?.name || 'Mi Empresa'}</p>
            <p className="text-xs text-brand-muted mt-0.5">{formatDateTime(sale.createdAt)}</p>
          </div>

          <div className="border-t border-b border-gray-100 py-4 mb-4 space-y-3">
            {sale.items.map((item: any, index: number) => (
              <div key={index} className="flex justify-between text-sm">
                <div>
                  <p className="font-medium text-brand-text">{item.productName}</p>
                  <p className="text-xs text-brand-muted">
                    {item.quantity} x {formatCurrency(item.unitPrice)}
                  </p>
                </div>
                <p className="font-semibold text-brand-text">{formatCurrency(item.total)}</p>
              </div>
            ))}
          </div>

          <div className="space-y-1.5 text-sm mb-6">
            <div className="flex justify-between text-brand-muted">
              <span>Subtotal</span>
              <span>{formatCurrency(sale.subtotal)}</span>
            </div>
            {sale.tax > 0 && (
              <div className="flex justify-between text-brand-muted">
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
            <div className="flex justify-between text-lg font-sans font-bold text-brand-text border-t border-gray-100 pt-2">
              <span>Total</span>
              <span>{formatCurrency(sale.total)}</span>
            </div>
          </div>

          <div className="text-center text-xs text-brand-muted mb-4 space-y-0.5">
            <p>Método de pago: {sale.paymentMethod === 'cash' ? 'Efectivo' : sale.paymentMethod === 'card' ? 'Tarjeta' : 'Transferencia'}</p>
            {sale.customerName && <p>Cliente: {sale.customerName}</p>}
            <p className="flex items-center justify-center gap-1 mt-1 pt-1 border-t border-gray-50">
              <User className="w-3 h-3" />
              Atendió: {user?.firstName} {user?.lastName}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
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

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .ticket-content, .ticket-content * { visibility: visible; }
          .ticket-content { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); width: 80mm; }
          .fixed { position: static; background: none; }
          button { display: none !important; }
        }
      `}</style>
    </div>
  );
};
