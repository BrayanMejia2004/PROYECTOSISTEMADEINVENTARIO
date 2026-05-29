import { useState } from 'react';
import { CartItem } from '../types';
import { formatCurrency } from '../../../lib/utils';
import { PosCustomerSelect } from './PosCustomerSelect';
import { PaymentModal } from './PaymentModal';
import { Trash2, ShoppingCart, Minus, Plus, Banknote, AlertCircle } from 'lucide-react';

interface PosCartProps {
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: (data: {
    customerName?: string;
    customerPhone?: string;
    paymentMethod: 'cash' | 'card' | 'transfer' | 'exchange';
    transferReference?: string;
    transferBank?: string;
    transferAmount?: number;
    cardBank?: string;
    cardReference?: string;
    exchangeFromSaleId?: string;
    exchangeCredit?: number;
  }) => void;
  total: number;
  subtotal: number;
  tax: number;
  discount: number;
  isPending?: boolean;
}

export const PosCart = ({ items, onUpdateQuantity, onRemoveItem, onCheckout, total, subtotal, tax, discount, isPending }: PosCartProps) => {
  const [selectedCustomer, setSelectedCustomer] = useState<{ name: string; phone?: string } | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const handleCheckout = (paymentData: {
    amountReceived: number; change: number;
    transferReference?: string; transferBank?: string; transferAmount?: number;
    cardBank?: string; cardReference?: string;
    exchangeFromSaleId?: string; exchangeCredit?: number;
    paymentMethod: 'cash' | 'card' | 'transfer' | 'exchange';
  }) => {
    onCheckout({
      customerName: selectedCustomer?.name,
      customerPhone: selectedCustomer?.phone,
      paymentMethod: paymentData.paymentMethod,
      ...(paymentData.paymentMethod === 'transfer' ? {
        transferReference: paymentData.transferReference,
        transferBank: paymentData.transferBank,
        transferAmount: paymentData.transferAmount,
      } : {}),
      ...(paymentData.paymentMethod === 'card' ? {
        cardBank: paymentData.cardBank,
        cardReference: paymentData.cardReference,
      } : {}),
      exchangeFromSaleId: paymentData.exchangeFromSaleId,
      exchangeCredit: paymentData.exchangeCredit,
    });
    setShowPaymentModal(false);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="shrink-0 mb-2">
        <div className="flex items-center gap-1.5 mb-2">
          <ShoppingCart className="w-3.5 h-3.5 text-brand" />
          <h3 className="font-sans font-semibold text-brand-text text-sm">
            Carrito {items.length > 0 && `(${items.length})`}
          </h3>
        </div>
        <PosCustomerSelect
          selectedCustomer={selectedCustomer}
          onSelectCustomer={setSelectedCustomer}
        />
      </div>

      <div className="flex-1 overflow-y-auto -mx-2 px-2 space-y-1">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <div className="w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center mb-3">
              <ShoppingCart className="w-6 h-6 text-brand" />
            </div>
            <p className="text-sm font-medium text-brand-text mb-1">Carrito vacío</p>
            <p className="text-xs text-brand-muted">Selecciona productos para comenzar</p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.productId}
              className="flex items-center gap-3 p-2.5 rounded-lg bg-white border border-gray-50 hover:border-gray-200 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-brand-text line-clamp-2">{item.productName}</p>
                <p className="text-xs text-brand-muted">{formatCurrency(item.unitPrice)} c/u</p>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-brand-muted hover:text-brand hover:bg-brand/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center text-sm font-semibold text-brand-text tabular-nums">
                  {item.quantity}
                </span>
                <button
                  onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                  disabled={item.quantity >= item.stock}
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-brand-muted hover:text-brand hover:bg-brand/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <p className="text-sm font-semibold text-brand-text w-20 text-right tabular-nums">
                {formatCurrency(item.quantity * item.unitPrice)}
              </p>

              <button
                onClick={() => onRemoveItem(item.productId)}
                className="p-2.5 rounded-lg text-brand-muted hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>

      {items.length > 0 && (
        <div className="border-t border-gray-100 pt-2 mt-2 space-y-2 shrink-0">
          <div className="space-y-0.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-brand-muted">Subtotal</span>
              <span className="text-brand-text tabular-nums">{formatCurrency(subtotal)}</span>
            </div>
            {tax > 0 && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-brand-muted">IVA</span>
                <span className="text-brand-text tabular-nums">{formatCurrency(tax)}</span>
              </div>
            )}
            {discount > 0 && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-brand-muted">Descuento</span>
                <span className="text-red-500 tabular-nums">-{formatCurrency(discount)}</span>
              </div>
            )}
            <div className="flex items-center justify-between pt-0.5">
              <span className="text-xs text-brand-muted">Total</span>
              <span className="text-lg font-sans font-bold text-brand-text tabular-nums">
                {formatCurrency(total)}
              </span>
            </div>
          </div>

          {!selectedCustomer && items.length > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertCircle className="w-3 h-3 text-amber-500 shrink-0" />
              <p className="text-[10px] text-amber-700 leading-tight">Selecciona un cliente para cobrar</p>
            </div>
          )}

          <button
            onClick={() => setShowPaymentModal(true)}
            disabled={isPending || items.length === 0 || !selectedCustomer}
            className="w-full bg-brand text-white py-2.5 rounded-xl hover:bg-brand-dark transition-colors font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isPending ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                Procesando...
              </>
            ) : (
              <>
                <Banknote className="w-4 h-4" />
                Cobrar
              </>
            )}
          </button>
        </div>
      )}

      {showPaymentModal && (
        <PaymentModal
          total={total}
          onConfirm={(data) => handleCheckout(data)}
          onCancel={() => setShowPaymentModal(false)}
          isPending={isPending}
        />
      )}
    </div>
  );
};
