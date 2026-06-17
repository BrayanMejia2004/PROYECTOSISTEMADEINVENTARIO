import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { cashMovementSchema, type CashMovementForm as CashMovementFormData } from '@/features/sales/schemas';
import { X, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { NumberInput } from '@/components/ui/NumberInput';

interface CashMovementFormProps {
  onSubmit: (data: CashMovementFormData) => void;
  onClose: () => void;
  isPending?: boolean;
}

export const CashMovementForm = ({ onSubmit, onClose, isPending }: CashMovementFormProps) => {
  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CashMovementFormData>({
    resolver: zodResolver(cashMovementSchema),
    defaultValues: { type: 'entry', amount: undefined, reason: '' },
  });

  const type = watch('type');

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-sans font-semibold text-brand-text">Registrar Movimiento</h3>
          <button type="button" onClick={onClose} className="p-2.5 rounded-lg text-brand-muted hover:text-brand-text hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <p className="text-xs font-semibold text-brand-muted uppercase tracking-wider mb-2">Tipo</p>
            <div className="grid grid-cols-2 gap-2">
              <label
                className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
                  type === 'entry'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 text-brand-muted hover:border-gray-300'
                }`}
              >
                <input type="radio" {...register('type')} value="entry" className="sr-only" />
                <ArrowDownRight className="w-4 h-4" />
                Entrada
              </label>
              <label
                className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
                  type === 'exit'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 text-brand-muted hover:border-gray-300'
                }`}
              >
                <input type="radio" {...register('type')} value="exit" className="sr-only" />
                <ArrowUpRight className="w-4 h-4" />
                Salida
              </label>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-brand-muted uppercase tracking-wider mb-1.5 block">Monto</label>
            <Controller
              name="amount"
              control={control}
              render={({ field }) => (
                <NumberInput
                  value={field.value ?? ''}
                  onChange={(v) => field.onChange(v === '' ? undefined : v)}
                  min={1}
                  placeholder="0"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-lg font-semibold text-brand-text focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all"
                  autoFocus
                />
              )}
            />
            {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
          </div>

          <div>
            <label className="text-xs font-semibold text-brand-muted uppercase tracking-wider mb-1.5 block">Motivo</label>
            <input
              {...register('reason')}
              placeholder="Ej: Cambio para cliente, Pago proveedor..."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-brand-text focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all"
            />
            {errors.reason && <p className="text-red-500 text-xs mt-1">{errors.reason.message}</p>}
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-brand-muted hover:text-brand-text transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                type === 'entry' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-500 hover:bg-red-600'
              }`}
            >
              {isPending ? 'Registrando...' : type === 'entry' ? 'Registrar Entrada' : 'Registrar Salida'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
