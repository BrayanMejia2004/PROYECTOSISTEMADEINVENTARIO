import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { CartItem } from '@/features/sales/types';

const CAJAS_KEY = 'pos-cajas';
const CARTS_KEY = 'pos-carts';

export interface Caja {
  id: string;
  name: string;
}

export interface StoredCart {
  items: CartItem[];
  updatedAt: string;
}

interface CartActions {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  total: number;
  subtotal: number;
  tax: number;
  discount: number;
}

interface CartSummary {
  cartsWithItems: { id: string; name: string; count: number; updatedAt: string }[];
  totalItems: number;
}

interface CajasContextType {
  cajas: Caja[];
  createCaja: (name: string) => string;
  removeCaja: (id: string) => void;
  clearCajaCart: (id: string) => void;
  getCart: (cartId: string) => CartActions;
  summary: CartSummary;
}

const CartContext = createContext<CajasContextType | undefined>(undefined);

const DEFAULT_CAJAS: Caja[] = [
  { id: '1', name: 'Caja 1' },
  { id: '2', name: 'Caja 2' },
  { id: '3', name: 'Caja 3' },
];

const loadCajas = (): Caja[] => {
  try {
    const stored = localStorage.getItem(CAJAS_KEY) ?? sessionStorage.getItem(CAJAS_KEY);
    return stored ? JSON.parse(stored) : [...DEFAULT_CAJAS];
  } catch {
    return [...DEFAULT_CAJAS];
  }
};

const loadCarts = (): Record<string, StoredCart> => {
  try {
    const stored = localStorage.getItem(CARTS_KEY) ?? sessionStorage.getItem(CARTS_KEY);
    if (!stored) return {};
    const raw = JSON.parse(stored) as Record<string, any>;
    return Object.fromEntries(
      Object.entries(raw).map(([id, value]) => [
        id,
        Array.isArray(value) ? { items: value as CartItem[], updatedAt: new Date().toISOString() } : value as StoredCart,
      ])
    );
  } catch {
    return {};
  }
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cajas, setCajas] = useState<Caja[]>(loadCajas);
  const [carts, setCarts] = useState<Record<string, StoredCart>>(loadCarts);

  useEffect(() => {
    localStorage.setItem(CAJAS_KEY, JSON.stringify(cajas));
    sessionStorage.removeItem(CAJAS_KEY);
  }, [cajas]);

  useEffect(() => {
    localStorage.setItem(CARTS_KEY, JSON.stringify(carts));
    sessionStorage.removeItem(CARTS_KEY);
  }, [carts]);

  const createCaja = useCallback((name: string): string => {
    const id = Date.now().toString();
    setCajas((prev) => [...prev, { id, name }]);
    setCarts((prev) => ({ ...prev, [id]: { items: [], updatedAt: new Date().toISOString() } }));
    return id;
  }, []);

  const removeCaja = useCallback((id: string) => {
    setCajas((prev) => prev.filter((c) => c.id !== id));
    setCarts((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const setCart = useCallback((cartId: string, updater: (prev: CartItem[]) => CartItem[]) => {
    setCarts((prev) => ({
      ...prev,
      [cartId]: { items: updater(prev[cartId]?.items || []), updatedAt: new Date().toISOString() },
    }));
  }, []);

  const clearCajaCart = useCallback((cartId: string) => {
    setCart(cartId, () => []);
  }, [setCart]);

  const summary: CartSummary = cajas
    .filter((c) => (carts[c.id]?.items?.length || 0) > 0)
    .reduce(
      (acc, c) => {
        acc.cartsWithItems.push({ id: c.id, name: c.name, count: carts[c.id].items.length, updatedAt: carts[c.id].updatedAt });
        acc.totalItems += carts[c.id].items.length;
        return acc;
      },
      { cartsWithItems: [] as { id: string; name: string; count: number; updatedAt: string }[], totalItems: 0 }
    );

  const getCart = useCallback(
    (cartId: string): CartActions => {
      const items = carts[cartId]?.items || [];

      const addToCart = (newItem: CartItem) => {
        setCart(cartId, (prev) => {
          const existing = prev.find((item) => item.productId === newItem.productId);
          if (existing) {
            if (existing.quantity + newItem.quantity > existing.stock) {
              return prev;
            }
            return prev.map((item) =>
              item.productId === newItem.productId
                ? { ...item, quantity: item.quantity + newItem.quantity }
                : item
            );
          }
          if (newItem.quantity > newItem.stock) {
            return prev;
          }
          return [...prev, newItem];
        });
      };

      const updateQuantity = (productId: string, quantity: number) => {
        if (quantity < 1) return;
        setCart(cartId, (prev) =>
          prev.map((item) =>
            item.productId === productId && quantity <= item.stock ? { ...item, quantity } : item
          )
        );
      };

      const removeItem = (productId: string) => {
        setCart(cartId, (prev) => prev.filter((item) => item.productId !== productId));
      };

      const clearCart = () => {
        setCart(cartId, () => []);
      };

      let subtotal = 0;
      let tax = 0;
      let discount = 0;
      for (const item of items) {
        const itemSubtotal = item.quantity * item.unitPrice;
        subtotal += itemSubtotal;
        if (item.applyTax && item.taxPercentage) {
          tax += itemSubtotal * (item.taxPercentage / 100);
        }
        if (item.allowsDiscount && item.maxDiscount && item.maxDiscount > 0) {
          const itemWithTax = itemSubtotal + (item.applyTax && item.taxPercentage ? itemSubtotal * (item.taxPercentage / 100) : 0);
          discount += itemWithTax * (item.maxDiscount / 100);
        }
      }
      const total = subtotal + tax - discount;

      return { items, addToCart, updateQuantity, removeItem, clearCart, total, subtotal, tax, discount };
    },
    [carts, setCart]
  );

  return (
    <CartContext.Provider value={{ cajas, createCaja, removeCaja, clearCajaCart, getCart, summary }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCajas = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCajas must be used within CartProvider');
  return { cajas: context.cajas, createCaja: context.createCaja, removeCaja: context.removeCaja, clearCajaCart: context.clearCajaCart };
};

export const useCart = (cartId: string): CartActions => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context.getCart(cartId);
};

export const useCartSummary = (): CartSummary => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCartSummary must be used within CartProvider');
  return context.summary;
};
