import { useLowStock } from '../../inventory/hooks';
import { AlertTriangle, Package } from 'lucide-react';

export const LowStockCard = () => {
  const { data, isLoading } = useLowStock();
  const items = data?.data || [];

  if (isLoading) return <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6"><p className="text-sm text-brand-muted">Cargando...</p></div>;

  const count = items.length;
  const hasLowStock = count > 0;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-brand-muted uppercase tracking-wider">Productos Bajo Stock</p>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${hasLowStock ? 'bg-red-50' : 'bg-yellow-50'}`}>
          {hasLowStock ? <AlertTriangle className="w-4 h-4 text-red-500" /> : <Package className="w-4 h-4 text-yellow-600" />}
        </div>
      </div>
      <p className={`text-2xl font-sans font-bold ${hasLowStock ? 'text-red-600' : 'text-yellow-600'}`}>
        {count}
      </p>
      <p className="text-xs text-brand-muted mt-1">
        {hasLowStock
          ? `${count} producto${count !== 1 ? 's' : ''} por debajo del stock mínimo`
          : 'Todos los productos tienen stock suficiente'}
      </p>
      {hasLowStock && (
        <div className="mt-3 space-y-1.5 max-h-32 overflow-y-auto">
          {items.slice(0, 5).map((item: any) => (
            <div key={item._id} className="flex items-center justify-between text-xs">
              <span className="text-brand-text truncate mr-2">{item.productName || item.sku || '—'}</span>
              <span className="text-red-500 font-medium shrink-0">{item.quantity} / {item.minStock || 0}</span>
            </div>
          ))}
          {count > 5 && (
            <p className="text-xs text-brand-muted text-center pt-1">+{count - 5} más</p>
          )}
        </div>
      )}
    </div>
  );
};
