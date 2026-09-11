import { formatNumber } from '@/lib/utils';

const UNIT_ABBREV: Record<string, string> = {
  unit: 'ud',
  kg: 'kg',
  g: 'g',
  l: 'l',
  ml: 'ml',
  box: 'caja',
  pack: 'pkg',
};

type StockState = 'ok' | 'low' | 'out';

export const StockLevel = ({ stock, minStock, maxStock, unit }: {
  stock: number;
  minStock?: number;
  maxStock?: number;
  unit?: string;
}) => {
  const qty = stock ?? 0;
  const state: StockState = qty <= 0 ? 'out' : (minStock && qty < minStock ? 'low' : 'ok');
  const level = maxStock && maxStock > 0 ? Math.min(100, (qty / maxStock) * 100) : state === 'out' ? 0 : 100;
  const color = state === 'out' ? 'text-stock-out' : state === 'low' ? 'text-stock-low' : 'text-stock-ok';
  const barFill = state === 'out' ? 'bg-stock-out' : state === 'low' ? 'bg-stock-low' : 'bg-stock-ok';
  const message = state === 'out'
    ? 'Agotado'
    : state === 'low'
      ? `Bajo stock · mínimo ${formatNumber(minStock)}`
      : 'Stock suficiente';
  const abbr = unit ? (UNIT_ABBREV[unit] || unit) : '';

  return (
    <div className="flex flex-col items-center gap-1.5" title={message}>
      <span className={`font-semibold text-sm tabular-nums ${color}`}>
        {formatNumber(qty)}
        {abbr && <span className="ml-0.5 font-normal text-xs text-brand-muted">{abbr}</span>}
      </span>
      <span className="h-1 w-14 rounded-full bg-brand-bg overflow-hidden">
        <span className={`block h-full rounded-full ${barFill}`} style={{ width: `${level}%` }} />
      </span>
    </div>
  );
};