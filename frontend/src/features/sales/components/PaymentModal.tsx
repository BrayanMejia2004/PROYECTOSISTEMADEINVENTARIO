import { useState, useEffect, useRef } from 'react';
import { formatCurrency } from '../../../lib/utils';
import { NumberInput } from '../../../components/ui/NumberInput';
import { Banknote, X, ArrowRight, CheckCircle, Hash, RotateCcw, Search, AlertCircle, Loader2 } from 'lucide-react';
import { useSaleByNumber } from '../hooks';
import { Sale } from '../../../types';

const BANKS = [
  'Bancolombia', 'Nequi', 'Davivienda', 'Daviplata', 'BBVA',
  'Banco de Bogotá', 'Banco de Occidente', 'Banco Popular',
  'AV Villas', 'Scotiabank Colpatria', 'Caja Social',
  'Banco Agrario', 'Falabella', 'Pichincha', 'Itaú', 'Nu',
  'Lulo Bank', 'Otro',
];

interface PaymentModalProps {
  total: number;
  paymentMethod: 'cash' | 'card' | 'transfer' | 'exchange';
  onConfirm: (data: {
    amountReceived: number;
    change: number;
    transferReference?: string;
    transferBank?: string;
    transferAmount?: number;
    cardBank?: string;
    cardReference?: string;
    exchangeFromSaleId?: string;
    exchangeCredit?: number;
  }) => void;
  onCancel: () => void;
  isPending?: boolean;
}

export const PaymentModal = ({ total, paymentMethod, onConfirm, onCancel, isPending }: PaymentModalProps) => {
  const isCash = paymentMethod === 'cash';
  const isCard = paymentMethod === 'card';
  const isTransfer = paymentMethod === 'transfer';
  const isExchange = paymentMethod === 'exchange';
  const needsBankRef = isCard || isTransfer;

  const [amountReceived, setAmountReceived] = useState(isCash ? 0 : total);
  const [transferReference, setTransferReference] = useState('');
  const [transferBank, setTransferBank] = useState('');
  const [cardBank, setCardBank] = useState('');
  const [cardReference, setCardReference] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const [exchangeSaleNumber, setExchangeSaleNumber] = useState('');
  const [searchSaleNumber, setSearchSaleNumber] = useState<string | null>(null);
  const [extraPaymentMethod, setExtraPaymentMethod] = useState<'cash' | 'card' | 'transfer'>('cash');
  const [extraCardBank, setExtraCardBank] = useState('');
  const [extraCardReference, setExtraCardReference] = useState('');
  const [extraTransferBank, setExtraTransferBank] = useState('');
  const [extraTransferReference, setExtraTransferReference] = useState('');

  const { data: exchangeResult, isLoading: loadingExchange, error: exchangeFetchError } = useSaleByNumber(searchSaleNumber);

  const exchangeSale = exchangeResult?.data as Sale | undefined;
  const availableCredit = exchangeSale?.availableExchangeCredit ?? 0;
  const exchangeCredit = Math.min(total, availableCredit);
  const extraAmount = total - exchangeCredit;

  const change = Math.max(0, amountReceived - total);

  useEffect(() => {
    if (!isCash) setAmountReceived(total);
  }, [isCash, total]);

  useEffect(() => {
    if (isCash && inputRef.current) inputRef.current.focus();
  }, [isCash]);

  const handleSearchSale = () => {
    if (!exchangeSaleNumber.trim()) {
      setError('Ingresa el número de ticket de la venta original');
      return;
    }
    setError('');
    setSearchSaleNumber(exchangeSaleNumber.trim());
  };

  const handleConfirm = () => {
    setError('');

    if (isExchange) {
      if (!exchangeSale) {
        setError('Debes buscar y seleccionar una venta original');
        return;
      }
      if (availableCredit <= 0) {
        setError('Esta venta ya fue intercambiada completamente y no tiene crédito disponible');
        return;
      }
      if (total < availableCredit) {
        setError(`El total del carrito debe ser al menos ${formatCurrency(availableCredit)}`);
        return;
      }
      if (extraAmount > 0) {
        if (extraPaymentMethod === 'transfer' && (!extraTransferReference.trim() || !extraTransferBank)) {
          setError('Completa los datos de la transferencia');
          return;
        }
        if (extraPaymentMethod === 'card' && (!extraCardReference.trim() || !extraCardBank)) {
          setError('Completa los datos de la tarjeta');
          return;
        }
      }
      onConfirm({
        amountReceived: total,
        change: 0,
        exchangeFromSaleId: exchangeSale._id,
        exchangeCredit,
        ...(extraAmount > 0 ? { paymentMethod: extraPaymentMethod } : { paymentMethod: 'exchange' as const }),
        ...(extraAmount > 0 && extraPaymentMethod === 'transfer' ? {
          transferReference: extraTransferReference.trim(),
          transferBank: extraTransferBank,
          transferAmount: extraAmount,
        } : {}),
        ...(extraAmount > 0 && extraPaymentMethod === 'card' ? {
          cardBank: extraCardBank,
          cardReference: extraCardReference.trim(),
        } : {}),
      });
      return;
    }

    if (isTransfer) {
      if (!transferReference.trim()) { setError('La referencia de transferencia es obligatoria'); return; }
      if (!transferBank) { setError('Selecciona el banco de origen'); return; }
    }
    if (isCard) {
      if (!cardReference.trim()) { setError('La referencia de la transacción es obligatoria'); return; }
      if (!cardBank) { setError('Selecciona el banco o entidad'); return; }
    }

    onConfirm({
      amountReceived,
      change,
      ...(isTransfer ? { transferReference: transferReference.trim(), transferBank, transferAmount: total } : {}),
      ...(isCard ? { cardBank, cardReference: cardReference.trim() } : {}),
    });
  };

  const canConfirm = isExchange
    ? total > 0 && !!exchangeSale && total >= availableCredit && availableCredit > 0 && (extraAmount <= 0 || (extraPaymentMethod === 'cash' || (extraPaymentMethod === 'transfer' && !!extraTransferReference.trim() && !!extraTransferBank) || (extraPaymentMethod === 'card' && !!extraCardReference.trim() && !!extraCardBank)))
    : isCash
      ? amountReceived >= total && total > 0
      : isTransfer
        ? total > 0 && !!transferReference.trim() && !!transferBank
        : isCard
          ? total > 0 && !!cardReference.trim() && !!cardBank
          : total > 0;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && canConfirm) handleConfirm();
  };

  const paymentLabel = isCash ? 'Efectivo recibido' : 'Total a cobrar';
  const methodLabel = isExchange ? 'Intercambio' : isCash ? 'Efectivo' : paymentMethod === 'card' ? 'Tarjeta' : 'Transferencia';

  const renderExchangeSection = () => (
    <>
      <div className="space-y-3">
        <label className="text-sm font-medium text-brand-text">Venta original (N° ticket)</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={exchangeSaleNumber}
            onChange={(e) => { setExchangeSaleNumber(e.target.value); setSearchSaleNumber(null); }}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSearchSale(); }}
            placeholder="Ej: VTA-000123"
            disabled={isPending}
            className="flex-1 px-4 py-3 text-sm text-brand-text rounded-xl border border-gray-200 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
          <button
            onClick={handleSearchSale}
            disabled={loadingExchange || !exchangeSaleNumber.trim()}
            className="px-4 py-3 bg-brand text-white rounded-xl hover:bg-brand-dark transition-colors disabled:opacity-50"
          >
            {loadingExchange ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {exchangeFetchError && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <p className="text-xs text-red-600">Venta no encontrada o no está devuelta</p>
        </div>
      )}

      {exchangeSale && (
        <div className="bg-brand-bg rounded-xl px-4 py-3 space-y-2">
          <div className="flex items-center gap-2 text-sm text-brand">
            <CheckCircle className="w-4 h-4" />
            <span className="font-medium">{exchangeSale.saleNumber}</span>
          </div>
          {exchangeSale.customerName && (
            <div className="flex justify-between text-sm">
              <span className="text-brand-muted">Cliente original</span>
              <span className="font-semibold text-brand-text">{exchangeSale.customerName}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-brand-muted">Crédito disponible</span>
            <span className="font-semibold text-brand-text">{formatCurrency(availableCredit)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-brand-muted">Total carrito</span>
            <span className="font-semibold text-brand-text">{formatCurrency(total)}</span>
          </div>

          {total < availableCredit && (
            <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
              <p className="text-xs text-amber-700">Debes agregar productos por al menos {formatCurrency(availableCredit)}</p>
            </div>
          )}

          {exchangeSale && availableCredit <= 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <p className="text-xs text-red-600">Esta venta ya fue intercambiada completamente y no tiene crédito disponible</p>
            </div>
          )}

          {extraAmount > 0 && availableCredit > 0 && (
            <div className="border-t border-gray-200 pt-2 mt-1 space-y-3">
              <div className="flex justify-between text-sm font-semibold text-brand-text">
                <span>A pagar adicional</span>
                <span className="text-amber-600">{formatCurrency(extraAmount)}</span>
              </div>

              <div>
                <p className="text-xs font-medium text-brand-muted mb-2">Método de pago del excedente</p>
                <div className="grid grid-cols-3 gap-2">
                  {(['cash', 'card', 'transfer'] as const).map((method) => (
                    <button
                      key={method}
                      onClick={() => setExtraPaymentMethod(method)}
                      className={`py-2 px-2 rounded-lg border text-xs font-medium transition-all ${
                        extraPaymentMethod === method
                          ? 'border-brand bg-brand/10 text-brand'
                          : 'border-gray-200 text-brand-muted hover:border-gray-300'
                      }`}
                    >
                      {method === 'cash' ? 'Efectivo' : method === 'card' ? 'Tarjeta' : 'Transferencia'}
                    </button>
                  ))}
                </div>
              </div>

              {extraPaymentMethod === 'transfer' && (
                <div className="space-y-2">
                  <select
                    value={extraTransferBank}
                    onChange={(e) => setExtraTransferBank(e.target.value)}
                    className="w-full px-4 py-3 text-sm rounded-xl border border-gray-200 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                  >
                    <option value="">Seleccionar banco</option>
                    {BANKS.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                  <input
                    type="text"
                    value={extraTransferReference}
                    onChange={(e) => setExtraTransferReference(e.target.value)}
                    placeholder="Número de referencia o comprobante"
                    className="w-full px-4 py-3 text-sm rounded-xl border border-gray-200 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                  />
                </div>
              )}

              {extraPaymentMethod === 'card' && (
                <div className="space-y-2">
                  <select
                    value={extraCardBank}
                    onChange={(e) => setExtraCardBank(e.target.value)}
                    className="w-full px-4 py-3 text-sm rounded-xl border border-gray-200 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                  >
                    <option value="">Seleccionar banco o entidad</option>
                    {BANKS.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                  <input
                    type="text"
                    value={extraCardReference}
                    onChange={(e) => setExtraCardReference(e.target.value)}
                    placeholder="Código de autorización o voucher"
                    className="w-full px-4 py-3 text-sm rounded-xl border border-gray-200 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                  />
                </div>
              )}

              {extraPaymentMethod === 'cash' && (
                <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                  <p className="text-xs text-green-700">El cliente paga {formatCurrency(extraAmount)} en efectivo</p>
                </div>
              )}
            </div>
          )}

          {extraAmount === 0 && total >= availableCredit && (
            <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
              <p className="text-xs text-green-700">Cubierto completamente por intercambio - sin cobro adicional</p>
            </div>
          )}
        </div>
      )}

      {!exchangeSale && !loadingExchange && !exchangeFetchError && (
        <div className="flex flex-col items-center gap-2 py-6 text-brand-muted">
          <RotateCcw className="w-8 h-8" />
          <p className="text-sm">Ingresa el número de ticket de la venta devuelta</p>
        </div>
      )}
    </>
  );

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onCancel}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isExchange ? 'bg-orange-100' : 'bg-brand/10'}`}>
              {isExchange ? <RotateCcw className="w-5 h-5 text-orange-500" /> : <Banknote className="w-5 h-5 text-brand" />}
            </div>
            <div>
              <h3 className="font-sans font-semibold text-brand-text">{isExchange ? 'Intercambio' : 'Cobro'}</h3>
              <p className="text-xs text-brand-muted">{methodLabel}</p>
            </div>
          </div>
          <button onClick={onCancel} className="p-2.5 rounded-lg text-brand-muted hover:text-brand-text hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 pb-6 space-y-6">
          <div className="bg-brand-bg rounded-xl px-5 py-4 text-center">
            <p className="text-xs font-medium text-brand-muted uppercase tracking-wider mb-1">Total</p>
            <p className="text-3xl font-sans font-bold text-brand-text tabular-nums">
              {formatCurrency(total)}
            </p>
          </div>

          {isExchange ? renderExchangeSection() : (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-brand-text">{paymentLabel}</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-brand-muted">$</span>
                  <NumberInput
                    ref={inputRef}
                    value={amountReceived}
                    onChange={(v) => setAmountReceived(v === '' ? 0 : v)}
                    min={0}
                    decimals={0}
                    disabled={!isCash || isPending}
                    className={`w-full pl-9 pr-4 py-3 text-xl font-bold text-brand-text tabular-nums rounded-xl border outline-none transition-all ${
                      amountReceived < total && isCash
                        ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-2 focus:ring-red-200'
                        : 'border-gray-200 bg-white focus:border-brand focus:ring-2 focus:ring-brand/20'
                    } ${!isCash ? 'bg-gray-50 text-brand-muted' : ''}`}
                    placeholder="0,00"
                  />
                </div>
                {isCash && amountReceived < total && (
                  <p className="text-xs text-red-500">El monto debe ser mayor o igual al total</p>
                )}
              </div>

              {needsBankRef && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-brand-text">
                      {isCard ? 'Banco o entidad' : 'Banco de origen'}
                    </label>
                    <select
                      value={isCard ? cardBank : transferBank}
                      onChange={(e) => isCard ? setCardBank(e.target.value) : setTransferBank(e.target.value)}
                      disabled={isPending}
                      className={`w-full px-4 py-3 text-sm text-brand-text rounded-xl border outline-none transition-all bg-white appearance-none ${
                        error && !(isCard ? cardBank : transferBank)
                          ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-2 focus:ring-red-200'
                          : 'border-gray-200 focus:border-brand focus:ring-2 focus:ring-brand/20'
                      }`}
                    >
                      <option value="">Seleccionar banco</option>
                      {BANKS.map((bank) => (
                        <option key={bank} value={bank}>{bank}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-brand-text">
                      {isCard ? 'Referencia de transacción' : 'Referencia de transferencia'}
                    </label>
                    <div className="relative">
                      <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
                      <input
                        type="text"
                        value={isCard ? cardReference : transferReference}
                        onChange={(e) => isCard ? setCardReference(e.target.value) : setTransferReference(e.target.value)}
                        disabled={isPending}
                        placeholder={isCard ? 'Código de autorización o voucher' : 'Número de referencia o comprobante'}
                        className={`w-full pl-11 pr-4 py-3 text-sm text-brand-text rounded-xl border outline-none transition-all ${
                          error && !(isCard ? cardReference.trim() : transferReference.trim())
                            ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-2 focus:ring-red-200'
                            : 'border-gray-200 bg-white focus:border-brand focus:ring-2 focus:ring-brand/20'
                        }`}
                      />
                    </div>
                  </div>
                </>
              )}

              {error && <p className="text-xs text-red-500 text-center">{error}</p>}

              <div className={`rounded-xl border-2 px-5 py-4 flex items-center justify-between transition-all ${
                change > 0 ? 'border-green-200 bg-green-50' : 'border-gray-100 bg-gray-50'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    change > 0 ? 'bg-green-200' : 'bg-gray-200'
                  }`}>
                    <ArrowRight className={`w-4 h-4 ${change > 0 ? 'text-green-700' : 'text-gray-500'}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-brand-text">Vuelto</p>
                    {change === 0 && !isCash && <p className="text-xs text-brand-muted">Pago exacto</p>}
                  </div>
                </div>
                <p className={`text-xl font-sans font-bold tabular-nums ${
                  change > 0 ? 'text-green-600' : 'text-brand-muted'
                }`}>
                  {formatCurrency(change)}
                </p>
              </div>
            </>
          )}

          <div className="flex gap-3 pt-3">
            <button
              onClick={onCancel}
              className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-brand-muted hover:text-brand-text hover:border-gray-300 transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={!canConfirm || isPending}
              className="flex-1 bg-brand text-white py-3 rounded-xl hover:bg-brand-dark transition-all font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  Procesando...
                </>
              ) : isExchange ? (
                <>
                  <RotateCcw className="w-4 h-4" />
                  Realizar intercambio
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  {change > 0 ? `Cobrar ${formatCurrency(total)}` : 'Confirmar pago'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
