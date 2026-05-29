import { useState } from 'react';
import { Navigate, Link, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCreateSale, useCurrentShift } from '../features/sales/hooks';
import { useCart, useCajas } from '../context/CartContext';
import { PosCart } from '../features/sales/components/PosCart';
import { PosProductSearch } from '../features/sales/components/PosProductSearch';
import { SaleReceipt } from '../features/sales/components/SaleReceipt';
import { Wallet, AlertCircle, X } from 'lucide-react';

export const PosPage = () => {
  const { user } = useAuth();
  const { cajas } = useCajas();
  const { cartId } = useParams<{ cartId: string }>();

  if (user?.role !== 'cashier') return <Navigate to="/" replace />;
  if (!cartId || !cajas.some((c) => c.id === cartId)) return <Navigate to="/" replace />;

  const { data: shiftData, isLoading: shiftLoading } = useCurrentShift();
  const shift = shiftData?.data;
  const isShiftOpen = !!shift && shift.status === 'open';

  const { items: cartItems, addToCart, updateQuantity, removeItem, clearCart, total, subtotal, tax: cartTax, discount: cartDiscount } = useCart(cartId);
  const [saleResult, setSaleResult] = useState<any>(null);
  const [saleError, setSaleError] = useState<string | null>(null);
  const [saleKey, setSaleKey] = useState(0);
  const { mutate: createSale, isPending } = useCreateSale();

  const handleAddToCart = addToCart;
  const handleUpdateQuantity = updateQuantity;
  const handleRemoveItem = removeItem;

  const handleCheckout = (data: {
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
  }) => {
    const discount = data.discountAmount || 0;
    createSale(
      {
        items: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
        paymentMethod: data.paymentMethod,
        tax: Math.round(cartTax),
        discount: Math.round(cartDiscount),
        subtotal: Math.round(subtotal),
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        transferReference: data.transferReference,
        transferBank: data.transferBank,
        transferAmount: data.transferAmount,
        cardBank: data.cardBank,
        cardReference: data.cardReference,
        exchangeFromSaleId: data.exchangeFromSaleId,
        exchangeCredit: data.exchangeCredit,
      },
      {
        onSuccess: (res) => {
          setSaleResult(res.data);
          setSaleError(null);
          clearCart();
          setSaleKey((k) => k + 1);
        },
        onError: (err: any) => {
          setSaleError(err?.response?.data?.message || 'Error al procesar la venta');
        },
      }
    );
  };

  if (shiftLoading) {
    return (
      <div className="h-[calc(100vh-5rem)] flex items-center justify-center">
        <p className="text-sm text-brand-muted">Cargando...</p>
      </div>
    );
  }

  if (!isShiftOpen) {
    return (
      <div className="h-[calc(100vh-5rem)] flex flex-col items-center justify-center">
        <div className="max-w-md text-center">
          <div className="w-20 h-20 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-6">
            <Wallet className="w-10 h-10 text-red-400" />
          </div>
          <h2 className="text-2xl font-sans font-bold text-brand-text mb-2">Caja no abierta</h2>
          <p className="text-brand-muted mb-8">
            Debes abrir la caja antes de poder realizar ventas. Ve a Gestión de Caja para iniciar tu turno.
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              to="/"
              className="px-5 py-2.5 border border-gray-200 text-brand-muted rounded-xl hover:text-brand-text hover:border-gray-300 transition-all text-sm font-medium"
            >
              Volver al inicio
            </Link>
            <Link
              to="/caja"
              className="px-5 py-2.5 bg-brand text-white rounded-xl hover:bg-brand-dark transition-all text-sm font-semibold"
            >
              Ir a Gestión de Caja
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-5rem)] flex flex-col">
      {saleError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setSaleError(null)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <h3 className="text-lg font-sans font-bold text-brand-text">Error</h3>
                  <button onClick={() => setSaleError(null)} className="p-1 rounded-lg hover:bg-gray-100 transition-colors text-brand-muted hover:text-brand-text shrink-0 ml-2">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="mt-2 text-sm text-brand-muted leading-relaxed">{saleError}</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSaleError(null)}
                className="px-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="flex-1 flex flex-col lg:flex-row gap-2 min-h-0">
        <div className="w-full lg:flex-[2] bg-white rounded-xl border border-gray-100 shadow-sm p-3 overflow-hidden flex flex-col">
          <PosProductSearch onAddToCart={handleAddToCart} cartItems={cartItems} />
        </div>
        <div className="w-full lg:flex-1 bg-white rounded-xl border border-gray-100 shadow-sm p-3 overflow-hidden flex flex-col">
          <PosCart
            key={`cart-${cartId}-${saleKey}`}
            items={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onCheckout={handleCheckout}
            total={total}
            subtotal={subtotal}
            tax={cartTax}
            discount={cartDiscount}
            isPending={isPending}
          />
        </div>
      </div>

      {saleResult && (
        <SaleReceipt sale={saleResult} onClose={() => setSaleResult(null)} />
      )}
    </div>
  );
};
