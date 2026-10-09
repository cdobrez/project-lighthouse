"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type CartLine = {
  mealId: string;
  slug: string;
  title: string;
  unitCents: number;
  qty: number;
  cookId: string;
  cookName: string;
  cookSlug: string;
  imageKey: string;
  cuisine: string;
  fulfillment: string[];
  readyWindow: string;
};

type CartState = {
  lines: CartLine[];
  add: (line: Omit<CartLine, "qty">, qty?: number) => { ok: boolean; reason?: string };
  remove: (mealId: string) => void;
  setQty: (mealId: string, qty: number) => void;
  clear: () => void;
  count: number;
  subtotalCents: number;
  cookId: string | null;
  hydrated: boolean;
};

const CartContext = createContext<CartState | null>(null);
const KEY = "gigkitchens.cart.v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) setLines(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(lines));
    } catch {
      /* ignore */
    }
  }, [lines, hydrated]);

  const add = useCallback<CartState["add"]>(
    (line, qty = 1) => {
      let result: { ok: boolean; reason?: string } = { ok: true };
      setLines((prev) => {
        if (prev.length && prev[0].cookId !== line.cookId) {
          result = { ok: false, reason: `Your basket already has food from ${prev[0].cookName}. One cook per order keeps pickup simple, so finish or clear that basket first.` };
          return prev;
        }
        const existing = prev.find((l) => l.mealId === line.mealId);
        if (existing) {
          return prev.map((l) => (l.mealId === line.mealId ? { ...l, qty: l.qty + qty } : l));
        }
        return [...prev, { ...line, qty }];
      });
      return result;
    },
    []
  );

  const remove = useCallback((mealId: string) => setLines((prev) => prev.filter((l) => l.mealId !== mealId)), []);
  const setQty = useCallback(
    (mealId: string, qty: number) =>
      setLines((prev) => (qty <= 0 ? prev.filter((l) => l.mealId !== mealId) : prev.map((l) => (l.mealId === mealId ? { ...l, qty } : l)))),
    []
  );
  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<CartState>(() => {
    const count = lines.reduce((a, l) => a + l.qty, 0);
    const subtotalCents = lines.reduce((a, l) => a + l.qty * l.unitCents, 0);
    return { lines, add, remove, setQty, clear, count, subtotalCents, cookId: lines[0]?.cookId ?? null, hydrated };
  }, [lines, add, remove, setQty, clear, hydrated]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartState {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
