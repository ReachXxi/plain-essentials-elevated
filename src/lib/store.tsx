import {
  createContext,
  type Context,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useQuery } from "@tanstack/react-query";
import { getSiteData } from "./plain.functions";
import {
  cartTotalUsd,
  defaultSettings,
  lineKey,
  type CartLine,
  type GalleryItem,
  type Product,
  type SiteSettings,
} from "./site";

type StoreValue = {
  settings: SiteSettings;
  products: Product[];
  gallery: GalleryItem[];
  loading: boolean;
  refresh: () => void;
  cart: CartLine[];
  addToCart: (line: CartLine) => void;
  setQty: (key: string, qty: number) => void;
  removeFromCart: (key: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  wishlist: string[];
  toggleWishlist: (id: string) => void;
  lastAdded: CartLine | null;
  dismissLastAdded: () => void;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
};

const g = globalThis as unknown as { __plainStoreContext?: Context<StoreValue | null> };
const StoreContext: Context<StoreValue | null> =
  g.__plainStoreContext ?? (g.__plainStoreContext = createContext<StoreValue | null>(null));

function load<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function persist(key: string, value: unknown) {
  if (typeof window !== "undefined")
    window.localStorage.setItem(key, JSON.stringify(value));
}

export { lineKey };

export function StoreProvider({ children }: { children: ReactNode }) {
  const query = useQuery({
    queryKey: ["site-data"],
    queryFn: () => getSiteData(),
    staleTime: 10_000,
    refetchOnWindowFocus: true,
  });

  const [cart, setCart] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [lastAdded, setLastAdded] = useState<CartLine | null>(null);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    setCart(load("plain.cart", [] as CartLine[]));
    setWishlist(load("plain.wishlist", [] as string[]));
  }, []);

  const addToCart = useCallback((line: CartLine) => {
    setCart((prev) => {
      const next = [...prev];
      const i = next.findIndex((l) => lineKey(l) === lineKey(line));
      const existing = i >= 0 ? next[i] : undefined;
      if (existing) next[i] = { ...existing, qty: existing.qty + line.qty };
      else next.push(line);
      persist("plain.cart", next);
      return next;
    });
    setLastAdded(line);
  }, []);

  const setQty = useCallback((key: string, qty: number) => {
    setCart((prev) => {
      const next = prev
        .map((l) => (lineKey(l) === key ? { ...l, qty: Math.max(1, qty) } : l))
        .filter((l) => l.qty > 0);
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

  const settings = useMemo<SiteSettings>(
    () => ({ ...defaultSettings, ...((query.data?.settings ?? {}) as Partial<SiteSettings>) }),
    [query.data],
  );

  const value = useMemo<StoreValue>(
    () => ({
      settings,
      products: (query.data?.products ?? []) as Product[],
      gallery: (query.data?.gallery ?? []) as GalleryItem[],
      loading: query.isLoading,
      refresh: () => void query.refetch(),
      cart,
      addToCart,
      setQty,
      removeFromCart,
      clearCart,
      cartCount: cart.reduce((s, l) => s + l.qty, 0),
      cartTotal: cartTotalUsd(cart),
      wishlist,
      toggleWishlist,
      lastAdded,
      dismissLastAdded: () => setLastAdded(null),
      cartOpen,
      setCartOpen,
    }),
    [
      settings,
      query,
      cart,
      addToCart,
      setQty,
      removeFromCart,
      clearCart,
      wishlist,
      toggleWishlist,
      lastAdded,
      cartOpen,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
