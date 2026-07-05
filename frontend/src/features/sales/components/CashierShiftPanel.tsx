import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Wallet, Lock, ShoppingCart } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useCurrentShift, useOpenShift, useCloseShift } from '@/features/sales/hooks';
import { useCartSummary } from '@/context/CartContext';
import { openShiftSchema, type OpenShiftForm } from '@/features/sales/schemas';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ShiftSummary } from '@/features/sales/components/ShiftSummary';
import { ShiftCloseReceipt } from '@/features/sales/components/ShiftCloseReceipt';
import { CashMovements } from '@/features/sales/components/CashMovements';
import { NumberInput } from '@/components/ui/NumberInput';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import type { CloseShiftData } from '@/types';

export const CashierShiftPanel = () => {
  const { user, tenant } = useAuth();
  const [showOpenShift, setShowOpenShift] = useState(false);
  const [closeReceiptData, setCloseReceiptData] = useState<CloseShiftData | null>(null);
  const [confirmClose, setConfirmClose] = useState(false);

  const { data: shiftData, isLoading: shiftLoading } = useCurrentShift();
  const { mutate: openShift, isPending: isOpening } = useOpenShift();
  const { mutate: closeShift, isPending: isClosing } = useCloseShift();

  const {
    control: openControl,
    handleSubmit: handleOpenSubmit,
    formState: { errors: openErrors },
    reset: resetOpen,
  } = useForm<OpenShiftForm>({
    resolver: zodResolver(openShiftSchema),
  });

  const onOpenShift = (data: OpenShiftForm) => {
    openShift(data.openingAmount, {
      onSuccess: () => { setShowOpenShift(false); resetOpen(); },
    });
  };

  const shift = shiftData?.data;
  const isOpen = !!shift && shift.status === 'open';
  const summary = shift?.summary;

  const { cartsWithItems, totalItems } = useCartSummary();

  const badgeLink = cartsWithItems.length === 1
    ? `/pos/${cartsWithItems[0].id}`
    : cartsWithItems.length > 1
      ? `/pos/${cartsWithItems[0].id}`
      : null;

  const badgeText = cartsWithItems.length === 1
    ? `${cartsWithItems[0].name}: ${cartsWithItems[0].count} producto${cartsWithItems[0].count !== 1 ? 's' : ''}`
    : cartsWithItems.length > 1
      ? `${totalItems} productos en ${cartsWithItems.length} cajas`
      : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
          <Wallet className="w-5 h-5 text-brand" />
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-sans font-bold text-brand-text">Gestión de Caja</h1>
          <p className="text-sm text-brand-muted">Administra tu turno y movimientos de efectivo</p>
        </div>
        {badgeLink && (
          <Link
            to={badgeLink}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand/10 text-brand hover:bg-brand/20 transition-colors text-sm font-medium"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>{badgeText}</span>
          </Link>
        )}
      </div>

      {shiftLoading ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center">
          <p className="text-sm text-brand-muted">Cargando...</p>
        </div>
      ) : !isOpen ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center max-w-lg mx-auto">
          <Wallet className="w-16 h-16 text-brand-muted/30 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-brand-text mb-2">Caja Cerrada</h2>
          <p className="text-sm text-brand-muted mb-6">Debe abrir la caja antes de comenzar a operar</p>

          {!showOpenShift ? (
            <button
              onClick={() => setShowOpenShift(true)}
              className="bg-brand text-white px-6 py-2.5 rounded-xl hover:bg-brand-dark transition-colors text-sm font-semibold"
            >
              Abrir Caja
            </button>
          ) : (
            <form onSubmit={handleOpenSubmit(onOpenShift)} className="max-w-xs mx-auto space-y-3">
              <Controller
                name="openingAmount"
                control={openControl}
                render={({ field }) => (
                  <NumberInput
                    value={field.value ?? ''}
                    onChange={(v) => field.onChange(v === '' ? undefined : v)}
                    min={0}
                    placeholder="Monto inicial en efectivo"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-center text-lg font-semibold text-brand-text focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all"
                    autoFocus
                  />
                )}
              />
              {openErrors.openingAmount && <p className="text-red-500 text-xs text-center">{openErrors.openingAmount.message}</p>}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setShowOpenShift(false); resetOpen(); }}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-brand-muted hover:text-brand-text transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isOpening}
                  className="flex-1 bg-brand text-white py-2.5 rounded-xl hover:bg-brand-dark transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isOpening ? 'Abriendo...' : 'Confirmar'}
                </button>
              </div>
            </form>
          )}
        </div>
      ) : (
        <>
          <ShiftSummary shift={shift} summary={summary} />

          <CashMovements shiftId={shift._id} />

          <div className="flex justify-end">
            <button
              onClick={() => setConfirmClose(true)}
              disabled={isClosing}
              className="flex items-center gap-2 bg-red-500 text-white px-5 py-2.5 rounded-xl hover:bg-red-600 transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Lock className="w-4 h-4" />
              {isClosing ? 'Cerrando...' : 'Cerrar Caja'}
            </button>
          </div>
        </>
      )}

      <ConfirmDialog
        open={confirmClose}
        onClose={() => setConfirmClose(false)}
        onConfirm={() => {
          closeShift(shift._id, {
            onSuccess: (res) => setCloseReceiptData(res.data),
          });
          setConfirmClose(false);
        }}
        title="Cerrar Caja"
        message="¿Estás seguro de cerrar la caja? Se generará el resumen final."
        confirmText="Cerrar Caja"
        variant="warning"
      />

      {closeReceiptData && (
        <ShiftCloseReceipt
          data={closeReceiptData}
          userName={`${user?.firstName || ''} ${user?.lastName || ''}`.trim()}
          tenantName={tenant?.name || ''}
          onClose={() => setCloseReceiptData(null)}
        />
      )}
    </div>
  );
};
