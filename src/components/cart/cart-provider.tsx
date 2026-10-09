"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "react";
import { cartStore } from "./cart-store";

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

function useHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const lines = useSyncExternalStore(cartStore.subscribe, cartStore.getSnapshot, cartStore.getServerSnapshot);
  const hydrated = useHydrated();

  const add = useCallback<CartState["add"]>((line, qty = 1) => {
    const prev = cartStore.getSnapshot();
    if (prev.length && prev[0].cookId !== line.cookId) {
      return {
        ok: false,
        reason: `Your basket already has food from ${prev[0].cookName}. One cook per order keeps pickup simple, so finish or clear that basket first.`,
      };
    }
    const existing = prev.find((l) => l.mealId === line.mealId);
    cartStore.set(existing ? prev.map((l) => (l.mealId === line.mealId ? { ...l, qty: l.qty + qty } : l)) : [...prev, { ...line, qty }]);
    return { ok: true };
  }, []);

  const remove = useCallback((mealId: string) => cartStore.set(cartStore.getSnapshot().filter((l) => l.mealId !== mealId)), []);
  const setQty = useCallback((mealId: string, qty: number) => {
    const prev = cartStore.getSnapshot();
    cartStore.set(qty <= 0 ? prev.filter((l) => l.mealId !== mealId) : prev.map((l) => (l.mealId === mealId ? { ...l, qty } : l)));
  }, []);
  const clear = useCallback(() => cartStore.set([]), []);

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
