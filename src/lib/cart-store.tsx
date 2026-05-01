import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Product } from "./products";

export type CartItem = {
  slug: string;
  name: string;
  price: number;
  image: string;
  size: string;
  qty: number;
};

type CartCtx = {
  items: CartItem[];
  add: (p: Product, size: string, qty?: number) => void;
  remove: (slug: string, size: string) => void;
  updateQty: (slug: string, size: string, qty: number) => void;
  clear: () => void;
  subtotal: number;
  count: number;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  wishlist: string[];
  toggleWish: (slug: string) => void;
};

const Ctx = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setOpen] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const c = localStorage.getItem("shaken-cart");
      const w = localStorage.getItem("shaken-wishlist");
      if (c) setItems(JSON.parse(c));
      if (w) setWishlist(JSON.parse(w));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem("shaken-cart", JSON.stringify(items));
  }, [items, hydrated]);

  useEffect(() => {
    if (hydrated) localStorage.setItem("shaken-wishlist", JSON.stringify(wishlist));
  }, [wishlist, hydrated]);

  const add: CartCtx["add"] = (p, size, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.slug === p.slug && i.size === size);
      if (existing) {
        return prev.map((i) =>
          i.slug === p.slug && i.size === size ? { ...i, qty: i.qty + qty } : i,
        );
      }
      return [...prev, { slug: p.slug, name: p.name, price: p.price, image: p.image, size, qty }];
    });
    setOpen(true);
  };

  const remove: CartCtx["remove"] = (slug, size) =>
    setItems((p) => p.filter((i) => !(i.slug === slug && i.size === size)));

  const updateQty: CartCtx["updateQty"] = (slug, size, qty) =>
    setItems((p) =>
      p.map((i) => (i.slug === slug && i.size === size ? { ...i, qty: Math.max(1, qty) } : i)),
    );

  const toggleWish = (slug: string) =>
    setWishlist((p) => (p.includes(slug) ? p.filter((s) => s !== slug) : [...p, slug]));

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const count = items.reduce((s, i) => s + i.qty, 0);

  return (
    <Ctx.Provider
      value={{
        items, add, remove, updateQty, clear: () => setItems([]),
        subtotal, count,
        isOpen, open: () => setOpen(true), close: () => setOpen(false),
        wishlist, toggleWish,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used within CartProvider");
  return c;
}
