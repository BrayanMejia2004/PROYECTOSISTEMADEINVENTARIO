import { useEffect, useState } from 'react';
import { getBranchComparison } from '@/features/reports/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Building2 } from 'lucide-react';
import type { BranchComparisonData } from '@/types';

export const BranchComparison = () => {
  const [data, setData] = useState<BranchComparisonData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getBranchComparison(
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          new Date().toISOString()
        );
        setData(response.data || []);
      } catch (error) {
        console.error('Error fetching branch comparison:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="text-sm text-brand-muted">Cargando...</div>;

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Building2 className="w-4 h-4 text-brand" />
        <h3 className="text-sm font-semibold text-brand-text">Comparativa de Sucursales</h3>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="branchName" tick={{ fontSize: 11 }} stroke="#94a3b8" />
          <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
          <Tooltip
            contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
          />
          <Bar dataKey="totalSales" fill="#2D8A4E" radius={[4, 4, 0, 0]} name="Ventas" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
