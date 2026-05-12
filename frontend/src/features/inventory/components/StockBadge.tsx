import { useLowStock } from '../hooks';
import { formatCurrency } from '../../../lib/utils';

export const StockBadge = ({ productId, branchId }: { productId: string; branchId?: string }) => {
  const { data } = useLowStock(branchId);
  
  const isLowStock = data?.data?.some(
    (item: any) => item.productId === productId && item.quantity <= item.minStock
  );

  if (!isLowStock) return null;

  return (
    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
      Stock Bajo
    </span>
  );
};
