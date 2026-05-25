import { useEffect, useState } from 'react';
import { getProfitabilityReport } from '../api';
import { formatCurrency, formatNumber } from '../../../lib/utils';
import { TrendingUp, AlertCircle } from 'lucide-react';

export const TopProductsCard = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 30);
        const response = await getProfitabilityReport(
          start.toISOString(),
          end.toISOString()
        );
        setProducts((response.data || []).slice(0, 5));
      } catch (err) {
        setError((err as any)?.message || 'Error al cargar');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6"><p className="text-sm text-brand-muted">Cargando...</p></div>;

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-red-200 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <p className="text-xs font-medium text-red-600">Error</p>
        </div>
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  const hasProducts = products.length > 0;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-brand-muted uppercase tracking-wider">Top Productos</p>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${hasProducts ? 'bg-blue-50' : 'bg-gray-50'}`}>
          <TrendingUp className={`w-4 h-4 ${hasProducts ? 'text-blue-600' : 'text-gray-400'}`} />
        </div>
      </div>
      <p className={`text-2xl font-sans font-bold ${hasProducts ? 'text-blue-600' : 'text-brand-muted'}`}>
        {hasProducts ? products[0]?.productName || '—' : 'Sin datos'}
      </p>
      <p className="text-xs text-brand-muted mt-1">Últimos 30 días</p>

      {hasProducts && (
        <div className="mt-3 space-y-1.5">
          {products.map((p: any) => (
            <div key={p._id || p.productName} className="flex items-center justify-between text-xs py-1 border-b border-gray-50 last:border-0">
              <span className="text-brand-text truncate mr-2">{p.productName}</span>
              <span className="text-brand-text font-medium shrink-0">
                {formatNumber(p.totalSold)} uds — {formatCurrency(p.totalRevenue)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
