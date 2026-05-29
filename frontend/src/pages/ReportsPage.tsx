import { SalesChart } from '../features/reports/components/SalesChart';
import { StockValueCard } from '../features/reports/components/StockValueCard';
import { StockPriceValueCard } from '../features/reports/components/StockPriceValueCard';
import { InventoryCostCard } from '../features/reports/components/InventoryCostCard';
import { SalesProfitCard } from '../features/reports/components/SalesProfitCard';
import { BranchComparison } from '../features/reports/components/BranchComparison';
import { BarChart3 } from 'lucide-react';

export const ReportsPage = () => {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-sans font-bold text-brand-text">Reportes</h1>
        <p className="text-sm text-brand-muted mt-1">Visualiza las métricas de tu negocio</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start mb-6">
        <StockValueCard />
        <StockPriceValueCard />
        <InventoryCostCard />
        <SalesProfitCard />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <SalesChart />
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <BranchComparison />
        </div>
      </div>
    </div>
  );
};
