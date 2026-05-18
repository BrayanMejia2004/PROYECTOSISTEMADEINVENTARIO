import { useSalesSummary } from '../hooks';
import { formatCurrency, formatNumber } from '../../../lib/utils';
import { ShoppingCart, DollarSign, Receipt, XCircle, Package } from 'lucide-react';

interface CardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  bgColor: string;
  iconColor: string;
}

const Card = ({ label, value, icon, bgColor, iconColor }: CardProps) => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${bgColor}`}>
      <div className={iconColor}>{icon}</div>
    </div>
    <div>
      <p className="text-xs font-medium text-brand-muted uppercase tracking-wider">{label}</p>
      <p className="text-lg font-sans font-bold text-brand-text mt-0.5">{value}</p>
    </div>
  </div>
);

export const SalesSummaryCards = () => {
  const { data, isLoading } = useSalesSummary();

  if (isLoading) return null;

  const s = data?.data;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      <Card
        label="Ventas Hoy"
        value={formatNumber(s?.salesToday ?? 0)}
        icon={<ShoppingCart className="w-5 h-5" />}
        bgColor="bg-blue-50"
        iconColor="text-blue-600"
      />
      <Card
        label="Total Vendido"
        value={formatCurrency(s?.totalRevenue ?? 0)}
        icon={<DollarSign className="w-5 h-5" />}
        bgColor="bg-green-50"
        iconColor="text-green-600"
      />
      <Card
        label="Ticket Promedio"
        value={formatCurrency(s?.avgTicket ?? 0)}
        icon={<Receipt className="w-5 h-5" />}
        bgColor="bg-yellow-50"
        iconColor="text-yellow-600"
      />
      <Card
        label="Devueltas"
        value={formatNumber(s?.cancelledCount ?? 0)}
        icon={<XCircle className="w-5 h-5" />}
        bgColor="bg-red-50"
        iconColor="text-red-600"
      />
      <Card
        label="Productos Vend."
        value={formatNumber(s?.totalProductsSold ?? 0)}
        icon={<Package className="w-5 h-5" />}
        bgColor="bg-purple-50"
        iconColor="text-purple-600"
      />
    </div>
  );
};
