import { useState } from 'react';
import { formatCurrency } from '../../../lib/utils';
import { CashMovementForm } from './CashMovementForm';
import { useMovements, useCreateMovement } from '../hooks';
import { ArrowDownRight, ArrowUpRight, Plus, Loader2 } from 'lucide-react';

interface CashMovementsProps {
  shiftId: string;
}

export const CashMovements = ({ shiftId }: CashMovementsProps) => {
  const [showForm, setShowForm] = useState(false);
  const { data: movementsData, isLoading } = useMovements(shiftId);
  const { mutate: createMovement, isPending } = useCreateMovement();

  const movements = movementsData?.data || [];

  const handleCreate = (input: { type: 'entry' | 'exit'; amount: number; reason: string }) => {
    createMovement(
      { shiftId, input },
      { onSuccess: () => setShowForm(false) }
    );
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-medium text-brand-muted uppercase tracking-wider">Movimientos del Día</p>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand/10 text-brand hover:bg-brand/20 transition-colors text-sm font-medium"
        >
          <Plus className="w-3.5 h-3.5" />
          Registrar
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 text-brand animate-spin" />
        </div>
      ) : movements.length === 0 ? (
        <div className="text-center py-8">
          <ArrowDownRight className="w-8 h-8 text-brand-muted/30 mx-auto mb-2" />
          <p className="text-sm text-brand-muted">No hay movimientos registrados hoy</p>
        </div>
      ) : (
        <div className="space-y-2">
          {movements.map((m: any) => (
            <div
              key={m._id}
              className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  m.type === 'entry' ? 'bg-green-50' : 'bg-red-50'
                }`}>
                  {m.type === 'entry' ? (
                    <ArrowDownRight className="w-4 h-4 text-green-600" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4 text-red-500" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-brand-text">{m.reason}</p>
                  <p className="text-xs text-brand-muted">{new Date(m.createdAt).toLocaleTimeString()}</p>
                </div>
              </div>
              <span className={`text-sm font-bold ${
                m.type === 'entry' ? 'text-green-600' : 'text-red-500'
              }`}>
                {m.type === 'entry' ? '+' : '-'}{formatCurrency(m.amount)}
              </span>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <CashMovementForm
          onSubmit={handleCreate}
          onClose={() => setShowForm(false)}
          isPending={isPending}
        />
      )}
    </div>
  );
};
