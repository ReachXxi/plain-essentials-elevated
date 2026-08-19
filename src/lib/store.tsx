import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { defaultProducts, WHATSAPP_NUMBER, naira, type Product } from "./catalog";

export type CartLine = {
  id: string;
  name: string;
  price: number;
  image: string;
  size: string;
  color: string;
  qty: number;
};

export type Order = {
  id: string;
  customer: string;
  total: number;
  items: number;
  status: "pending" | "approved" | "declined";
  createdAt: string;
};

type StoreValue = {
  products: Product[];
  setProducts: (p: Product[]) => void;
  cart: CartLine[];
  addToCart: (line: CartLine) => void;
  removeFromCart: (key: string) => void;
  clearCart: () => void;
  wishlist: string[];
  toggleWishlist: (id: string) => void;
  orders: Order[];
  addOrder: (o: Order) => void;
  setOrderStatus: (id: string, status: Order["status"]) => void;
  cartCount: number;
  cartTotal: number;
};

const StoreContext = createContext<StoreValue | null>(null);

function load<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function lineKey(l: CartLine) {
  return `${l.id}-${l.size}-${l.color}`;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProductsState] = useState<Product[]>(defaultProducts);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    setProductsState(load("plain.products", defaultProducts));
    setCart(load("plain.cart", [] as CartLine[]));
    setWishlist(load("plain.wishlist", [] as string[]));
    setOrders(load("plain.orders", [] as Order[]));
  }, []);

  const persist = (key: string, value: unknown) => {
    if (typeof window !== "undefined")
      window.localStorage.setItem(key, JSON.stringify(value));
  };

  const setProducts = useCallback((p: Product[]) => {
    setProductsState(p);
    persist("plain.products", p);
  }, []);

  const addToCart = useCallback((line: CartLine) => {
    setCart((prev) => {
      const next = [...prev];
      const i = next.findIndex((l) => lineKey(l) === lineKey(line));
      if (i >= 0) next[i] = { ...next[i], qty: next[i].qty + line.qty };
      else next.push(line);
      persist("plain.cart", next);
      return next;
    });
  }, []);

  const removeFromCart = useCallback((key: string) => {
    setCart((prev) => {
      const next = prev.filter((l) => lineKey(l) !== key);
      persist("plain.cart", next);
      return next;
    });
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    persist("plain.cart", []);
  }, []);

  const toggleWishlist = useCallback((id: string) => {
    setWishlist((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      persist("plain.wishlist", next);
      return next;
    });
  }, []);

  const addOrder = useCallback((o: Order) => {
    setOrders((prev) => {
      const next = [o, ...prev];
      persist("plain.orders", next);
      return next;
    });
  }, []);

  const setOrderStatus = useCallback((id: string, status: Order["status"]) => {
    setOrders((prev) => {
      const next = prev.map((o) => (o.id === id ? { ...o, status } : o));
      persist("plain.orders", next);
      return next;
    });
  }, []);

  const cartCount = cart.reduce((s, l) => s + l.qty, 0);
  const cartTotal = cart.reduce((s, l) => s + l.qty * l.price, 0);

  const value = useMemo(
    () => ({
      products,
      setProducts,
      cart,
      addToCart,
      removeFromCart,
      clearCart,
      wishlist,
      toggleWishlist,
      orders,
      addOrder,
      setOrderStatus,
      cartCount,
      cartTotal,
    }),
    [
      products,
      setProducts,
      cart,
      addToCart,
      removeFromCart,
      clearCart,
      wishlist,
      toggleWishlist,
      orders,
      addOrder,
      setOrderStatus,
      cartCount,
      cartTotal,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

export function whatsappLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function cartMessage(cart: CartLine[], total: number) {
  const lines = cart
    .map((l) => `• ${l.name} — ${l.size} / ${l.color} × ${l.qty} — ${naira(l.price * l.qty)}`)
    .join("\n");
  return `Hello PLAIN, I'd like to order:\n\n${lines}\n\nTotal: ${naira(total)}`;
}
