import { useState } from 'react';
import { Package, AlertTriangle, DollarSign, Users, ShoppingCart, ChevronRight, Plus, X } from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { useProducts } from '@/features/inventory/hooks';
import { useSales } from '@/features/sales/hooks';
import { OutOfStockCard } from '@/features/reports/components/OutOfStockCard';
import { LowStockCard } from '@/features/reports/components/LowStockCard';
import { useAuth } from '@/hooks/useAuth';
import { useCajas, useCartSummary } from '@/context/CartContext';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { Link } from 'react-router-dom';
import type { Sale, Product } from '@/types';

export const DashboardPage = () => {
  const { user } = useAuth();
  const { cajas, createCaja, removeCaja } = useCajas();
  const { cartsWithItems } = useCartSummary();

  if (user?.role === 'cashier') {
    const cajaItemsCount = (id: string) => cartsWithItems.find((c) => c.id === id)?.count || 0;

    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-sans font-bold text-brand-text">Caja</h1>
          <p className="text-sm text-brand-muted mt-1">Selecciona una caja para iniciar la venta</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {cajas.map((caja) => {
            const itemCount = cajaItemsCount(caja.id);
            return (
              <div key={caja.id} className="relative group/card">
                <Link
                  to={`/pos/${caja.id}`}
                  className="block bg-white rounded-xl border border-gray-100 shadow-sm p-6 hover:shadow-md hover:border-brand/30 transition-all duration-200"
                >
                  <div className="flex flex-col items-center text-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-brand/10 flex items-center justify-center group-hover/card:bg-brand/20 transition-colors">
                      <ShoppingCart className="w-8 h-8 text-brand" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-brand-text">{caja.name}</h3>
                      {itemCount > 0 ? (
                        <p className="text-sm text-brand mt-1">{itemCount} producto{itemCount !== 1 ? 's' : ''}</p>
                      ) : (
                        <p className="text-sm text-brand-muted mt-1">Haz clic para abrir</p>
                      )}
                    </div>
                    <div className="inline-flex items-center gap-1 text-sm font-medium text-brand group-hover/card:gap-2 transition-all">
                      Entrar <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
                <button
                  onClick={() => removeCaja(caja.id)}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center text-brand-muted hover:text-red-500 hover:border-red-200 opacity-0 group-hover/card:opacity-100 transition-all"
                  title="Eliminar caja"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}

          <NuevaCajaCard onAdd={createCaja} />
        </div>
      </div>
    );
  }

  const { data: productsData, isLoading: productsLoading } = useProducts();
  const { data: salesData, isLoading: salesLoading } = useSales({ limit: 0 });
  const [ventasPage, setVentasPage] = useState(1);
  const VENTAS_PER_PAGE = 3;

  const totalProducts = productsData?.meta?.total ?? 0;
  const completedSales = salesData?.data?.filter((s: Sale) => s.status === 'completed') ?? [];
  const totalSales = completedSales.length;
  const totalRevenue = completedSales.reduce((sum: number, s: Sale) => sum + (s.total || 0), 0) ?? 0;
  const lowStock = productsData?.data?.filter((p: Product) => p.stock && p.stock > 0 && p.minStock && p.stock <= p.minStock).length ?? 0;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-sans font-bold text-brand-text">Dashboard</h1>
        <p className="text-sm text-brand-muted mt-1">Resumen general de tu inventario</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<Package className="w-5 h-5" />}
          label="Productos registrados"
          value={productsLoading ? '...' : formatNumber(totalProducts)}
          sublabel="Total en inventario"
        />
        <StatCard
          icon={<AlertTriangle className="w-5 h-5" />}
          label="Productos con stock bajo"
          value={productsLoading ? '...' : formatNumber(lowStock)}
          sublabel="Requieren reposición"
          trend={lowStock > 0 ? { value: 'Atención', positive: false } : { value: 'OK', positive: true }}
        />
        <StatCard
          icon={<DollarSign className="w-5 h-5" />}
          label="Ventas totales"
          value={salesLoading ? '...' : formatCurrency(totalRevenue)}
          sublabel={totalSales === 1 ? '1 venta registrada' : `${totalSales} ventas registradas`}
        />
        <StatCard
          icon={<Users className="w-5 h-5" />}
          label="Sistema activo"
          value="En línea"
          sublabel="Todo funcionando"
        />
      </div>

      {(user?.role === 'owner' || user?.role === 'admin') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          <OutOfStockCard />
          <LowStockCard />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-sans font-semibold text-brand-text mb-4">Accesos Rápidos</h3>
          <div className="grid grid-cols-2 gap-3">
            <QuickLink href="/inventory/new" icon={<Package className="w-4 h-4" />} label="Nuevo Producto" />
            {user?.role !== 'owner' && user?.role !== 'admin' && <QuickLink href="/pos/1" icon={<DollarSign className="w-4 h-4" />} label="Ir a POS" />}
            <QuickLink href="/inventory" icon={<AlertTriangle className="w-4 h-4" />} label="Inventario" />
            <QuickLink href="/reports" icon={<Users className="w-4 h-4" />} label="Reportes" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-sans font-semibold text-brand-text mb-4">Últimas Ventas</h3>
          {salesLoading ? (
            <p className="text-sm text-brand-muted">Cargando...</p>
          ) : salesData?.data?.length ? (
            <>
              <div className="space-y-3 min-h-[200px]">
                {salesData.data
                  .slice((ventasPage - 1) * VENTAS_PER_PAGE, ventasPage * VENTAS_PER_PAGE)
                  .map((sale: Sale) => (
                    <div key={sale._id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-brand-text">{sale.saleNumber}</p>
                        <p className="text-xs text-brand-muted">{new Date(sale.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-semibold text-brand-text">{formatCurrency(sale.total)}</span>
                        {sale.status !== 'completed' && (
                          <p className="text-xs text-orange-500 font-medium">Devuelta</p>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
              {Math.ceil((salesData.data?.length ?? 0) / VENTAS_PER_PAGE) > 1 && (
                <div className="flex items-center justify-between pt-3 mt-2 border-t border-gray-100">
                  <span className="text-xs text-brand-muted">
                    Pág. {ventasPage} de {Math.ceil((salesData.data?.length ?? 0) / VENTAS_PER_PAGE)}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setVentasPage(p => Math.max(1, p - 1))}
                      disabled={ventasPage <= 1}
                      className="px-2.5 py-1 rounded-md text-xs font-medium text-brand-muted hover:text-brand-text hover:bg-gray-100 disabled:opacity-30 transition-colors"
                    >
                      ← Anterior
                    </button>
                    <button
                      onClick={() => setVentasPage(p => Math.min(Math.ceil((salesData.data?.length ?? 0) / VENTAS_PER_PAGE), p + 1))}
                      disabled={ventasPage >= Math.ceil((salesData.data?.length ?? 0) / VENTAS_PER_PAGE)}
                      className="px-2.5 py-1 rounded-md text-xs font-medium text-brand-muted hover:text-brand-text hover:bg-gray-100 disabled:opacity-30 transition-colors"
                    >
                      Siguiente →
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-brand-muted">No hay ventas registradas aún</p>
          )}
        </div>
      </div>
    </div>
  );
};

const NuevaCajaCard = ({ onAdd }: { onAdd: (name: string) => string }) => {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');

  const handleCreate = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setName('');
    setShowForm(false);
  };

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-6 hover:border-brand/40 hover:bg-brand/5 transition-all duration-200 flex flex-col items-center justify-center gap-3 min-h-[200px]"
      >
        <div className="w-12 h-12 rounded-xl bg-brand/5 flex items-center justify-center">
          <Plus className="w-6 h-6 text-brand" />
        </div>
        <span className="text-sm font-medium text-brand-muted">Nueva Caja</span>
      </button>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-brand/30 shadow-sm p-6 flex flex-col items-center justify-center gap-3 min-h-[200px]">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nombre de la caja"
        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-center text-sm font-semibold text-brand-text focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all"
        autoFocus
        onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') { setName(''); setShowForm(false); } }}
      />
      <div className="flex gap-2 w-full">
        <button
          onClick={() => { setName(''); setShowForm(false); }}
          className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-sm text-brand-muted hover:text-brand-text transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={handleCreate}
          disabled={!name.trim()}
          className="flex-1 bg-brand text-white py-2 rounded-xl hover:bg-brand-dark transition-colors text-sm font-semibold disabled:opacity-50"
        >
          Crear
        </button>
      </div>
    </div>
  );
};

const QuickLink = ({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) => (
  <a
    href={href}
    className="flex items-center gap-3 px-4 py-3 rounded-lg bg-brand-bg text-brand-text hover:bg-brand/10 hover:text-brand transition-all text-sm font-medium"
  >
    {icon}
    {label}
  </a>
);
