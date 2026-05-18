import { useState } from 'react';
import { Navigate, Link, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCreateSale, useCurrentShift } from '../features/sales/hooks';
import { useCart, useCajas } from '../context/CartContext';
import { PosCart } from '../features/sales/components/PosCart';
import { PosProductSearch } from '../features/sales/components/PosProductSearch';
import { SaleReceipt } from '../features/sales/components/SaleReceipt';
import { ArrowLeft, Wallet } from 'lucide-react';

export const PosPage = () => {
  const { user } = useAuth();
  const { cajas } = useCajas();
  const { cartId } = useParams<{ cartId: string }>();

  if (user?.role !== 'cashier') return <Navigate to="/" replace />;
  if (!cartId || !cajas.some((c) => c.id === cartId)) return <Navigate to="/" replace />;

  const { data: shiftData, isLoading: shiftLoading } = useCurrentShift();
  const shift = shiftData?.data;
  const isShiftOpen = !!shift && shift.status === 'open';

  const { items: cartItems, addToCart, updateQuantity, removeItem, clearCart, total } = useCart(cartId);
  const [saleResult, setSaleResult] = useState<any>(null);
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
    createSale(
      {
        items: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
        paymentMethod: data.paymentMethod,
        tax: 0,
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
          clearCart();
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
      <div className="flex items-center gap-3 mb-4 shrink-0">
        <Link
          to="/"
          className="flex items-center gap-1.5 text-sm text-brand-muted hover:text-brand transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Link>
        <div className="w-px h-5 bg-gray-200" />
        <h1 className="text-xl font-sans font-bold text-brand-text">Punto de Venta — {cajas.find((c) => c.id === cartId)?.name || `Caja ${cartId}`}</h1>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
        <div className="w-full lg:flex-[2] bg-white rounded-xl border border-gray-100 shadow-sm p-4 overflow-hidden flex flex-col">
          <PosProductSearch onAddToCart={handleAddToCart} />
        </div>
        <div className="w-full lg:flex-1 lg:max-w-sm bg-white rounded-xl border border-gray-100 shadow-sm p-4 overflow-hidden flex flex-col">
          <PosCart
            items={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onCheckout={handleCheckout}
            total={total}
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
