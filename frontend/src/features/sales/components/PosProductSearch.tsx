import { useState, useEffect, useRef } from 'react';
import { useProducts } from '../hooks';
import { getProductByBarcode } from '../../../features/inventory/api';
import { formatCurrency, formatNumber } from '../../../lib/utils';
import { CartItem } from '../types';
import { Search, Barcode, Plus, Package, Loader2 } from 'lucide-react';

interface PosProductSearchProps {
  onAddToCart: (item: CartItem) => void;
}

export const PosProductSearch = ({ onAddToCart }: PosProductSearchProps) => {
  const [search, setSearch] = useState('');
  const [barcode, setBarcode] = useState('');
  const [barcodeFeedback, setBarcodeFeedback] = useState<{ ok: boolean; msg: string } | null>(null);
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading } = useProducts(
    search ? { search, limit: 50 } : { limit: 50 }
  );

  const products = data?.data ?? [];

  useEffect(() => {
    if (barcodeFeedback) {
      const t = setTimeout(() => setBarcodeFeedback(null), 2000);
      return () => clearTimeout(t);
    }
  }, [barcodeFeedback]);

  const handleBarcodeSearch = async () => {
    const code = barcode.trim();
    if (!code) return;

    try {
      const res = await getProductByBarcode(code);
      const product = res.data;
      if (product) {
        onAddToCart({
          productId: product._id,
          productName: product.name,
          sku: product.sku,
          barcode: product.barcode,
          stock: product.stock ?? 0,
          quantity: 1,
          unitPrice: product.price,
          total: product.price,
        });
        setBarcodeFeedback({ ok: true, msg: `${product.name} agregado` });
      } else {
        setBarcodeFeedback({ ok: false, msg: 'Producto no encontrado' });
      }
    } catch {
      setBarcodeFeedback({ ok: false, msg: 'Error al buscar' });
    }
    setBarcode('');
  };

  const handleAddToCart = (product: any) => {
    onAddToCart({
      productId: product._id,
      productName: product.name,
      sku: product.sku,
      barcode: product.barcode,
      stock: product.stock ?? 0,
      quantity: 1,
      unitPrice: product.price,
      total: product.price,
      costPrice: product.costPrice,
      applyTax: product.applyTax,
      taxPercentage: product.taxPercentage,
      allowsDiscount: product.allowsDiscount,
      maxDiscount: product.maxDiscount,
    });
    barcodeInputRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="space-y-2 mb-4 shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
          <input
            type="text"
            placeholder="Buscar por nombre o SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 text-sm text-brand-text placeholder:text-gray-400 focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all"
          />
        </div>

        <div className="relative">
          <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
          <input
            ref={barcodeInputRef}
            type="text"
            placeholder="Escanear código de barras..."
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleBarcodeSearch(); }}
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 text-sm text-brand-text placeholder:text-gray-400 focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all font-mono"
            autoFocus
          />
          {barcodeFeedback && (
            <div
              className={`absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${
                barcodeFeedback.ok
                  ? 'bg-green-50 text-green-700'
                  : 'bg-red-50 text-red-600'
              }`}
            >
              {barcodeFeedback.ok ? (
                <><span className="w-1.5 h-1.5 rounded-full bg-green-500" />{barcodeFeedback.msg}</>
              ) : (
                <>{barcodeFeedback.msg}</>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="w-6 h-6 text-brand animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <Package className="w-10 h-10 text-brand-muted/30 mb-2" />
            <p className="text-sm text-brand-muted">
              {search ? 'Sin resultados' : 'No hay productos disponibles'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {products.map((product: any) => {
              const outOfStock = (product.stock ?? 0) <= 0;
              const stockLevel = (product.stock ?? 0) <= 0 ? 'empty' : (product.stock ?? 0) <= product.minStock ? 'low' : 'ok';
              const stockColors = {
                empty: 'bg-red-50 text-red-600 border-red-200',
                low: 'bg-yellow-50 text-yellow-700 border-yellow-200',
                ok: 'bg-green-50 text-green-700 border-green-200',
              };
              return (
                <button
                  key={product._id}
                  onClick={() => !outOfStock && handleAddToCart(product)}
                  disabled={outOfStock}
                  className={`group relative bg-white rounded-xl border border-gray-100 shadow-sm p-2.5 text-left transition-all duration-150 flex flex-col ${
                    outOfStock
                      ? 'opacity-40 cursor-not-allowed'
                      : 'hover:shadow-md hover:border-brand/30 hover:-translate-y-0.5 cursor-pointer active:scale-[0.98]'
                  }`}
                >
                  <div className="w-full aspect-[4/3] rounded-lg bg-gray-50 mb-2.5 overflow-hidden">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const img = e.currentTarget;
                          img.style.display = 'none';
                          const parent = img.parentElement;
                          if (parent) {
                            parent.innerHTML = '<div class="w-full h-full flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-gray-200"><path d="M16.5 9.4 7.55 4.24a1 1 0 0 0-1.1 0L2 6.5M16.5 9.4l5.5 3.1M16.5 9.4V4.5M7.55 4.24 2 6.5M2 6.5l5.5 9.4M2 6.5v7.6l5.5 3.1m0 0 5.5-3.1m0 0L18.5 13M12.5 17.6V10"/></svg></div>';
                          }
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-8 h-8 text-gray-200" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 flex-1 min-w-0">
                    <p className="text-base font-semibold text-brand-text leading-snug line-clamp-2">
                      {product.name}
                    </p>
                    <p className="text-base font-bold text-brand">
                      {formatCurrency(product.price)}
                    </p>
                    <div className="flex items-center gap-1.5 mt-auto pt-1">
                      <div className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${stockColors[stockLevel]}`}>
                        <Package className="w-3 h-3" />
                        {formatNumber(product.stock ?? 0)} uds
                      </div>
                    </div>
                  </div>
                  {!outOfStock && (
                    <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-brand/10 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:bg-brand group-active:scale-90 transition-all">
                      <Plus className="w-4 h-4 text-brand group-hover:text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
