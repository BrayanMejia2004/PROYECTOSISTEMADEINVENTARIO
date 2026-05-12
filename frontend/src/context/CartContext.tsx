import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { CartItem } from '../features/sales/types';

const CAJAS_KEY = 'pos-cajas';
const CARTS_KEY = 'pos-carts';

export interface Caja {
  id: string;
  name: string;
}

interface CartActions {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  total: number;
}

interface CartSummary {
  cartsWithItems: { id: string; name: string; count: number }[];
  totalItems: number;
}

interface CajasContextType {
  cajas: Caja[];
  createCaja: (name: string) => string;
  removeCaja: (id: string) => void;
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
    const stored = sessionStorage.getItem(CAJAS_KEY);
    return stored ? JSON.parse(stored) : [...DEFAULT_CAJAS];
  } catch {
    return [...DEFAULT_CAJAS];
  }
};

const loadCarts = (): Record<string, CartItem[]> => {
  try {
    const stored = sessionStorage.getItem(CARTS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cajas, setCajas] = useState<Caja[]>(loadCajas);
  const [carts, setCarts] = useState<Record<string, CartItem[]>>(loadCarts);

  useEffect(() => {
    sessionStorage.setItem(CAJAS_KEY, JSON.stringify(cajas));
  }, [cajas]);

  useEffect(() => {
    sessionStorage.setItem(CARTS_KEY, JSON.stringify(carts));
  }, [carts]);

  const createCaja = useCallback((name: string): string => {
    const id = Date.now().toString();
    setCajas((prev) => [...prev, { id, name }]);
    setCarts((prev) => ({ ...prev, [id]: [] }));
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
    setCarts((prev) => ({ ...prev, [cartId]: updater(prev[cartId] || []) }));
  }, []);

  const summary: CartSummary = cajas
    .filter((c) => (carts[c.id]?.length || 0) > 0)
    .reduce(
      (acc, c) => {
        acc.cartsWithItems.push({ id: c.id, name: c.name, count: carts[c.id].length });
        acc.totalItems += carts[c.id].length;
        return acc;
      },
      { cartsWithItems: [] as { id: string; name: string; count: number }[], totalItems: 0 }
    );

  const getCart = useCallback(
    (cartId: string): CartActions => {
      const items = carts[cartId] || [];

      const addToCart = (newItem: CartItem) => {
        setCart(cartId, (prev) => {
          const existing = prev.find((item) => item.productId === newItem.productId);
          if (existing) {
            return prev.map((item) =>
              item.productId === newItem.productId
                ? { ...item, quantity: item.quantity + newItem.quantity }
                : item
            );
          }
          return [...prev, newItem];
        });
      };

      const updateQuantity = (productId: string, quantity: number) => {
        if (quantity < 1) return;
        setCart(cartId, (prev) =>
          prev.map((item) =>
            item.productId === productId ? { ...item, quantity } : item
          )
        );
      };

      const removeItem = (productId: string) => {
        setCart(cartId, (prev) => prev.filter((item) => item.productId !== productId));
      };

      const clearCart = () => {
        setCart(cartId, () => []);
      };

      const total = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

      return { items, addToCart, updateQuantity, removeItem, clearCart, total };
    },
    [carts, setCart]
  );

  return (
    <CartContext.Provider value={{ cajas, createCaja, removeCaja, getCart, summary }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCajas = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCajas must be used within CartProvider');
  return { cajas: context.cajas, createCaja: context.createCaja, removeCaja: context.removeCaja };
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
