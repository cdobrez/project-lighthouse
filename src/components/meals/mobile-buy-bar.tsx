"use client";

import type { MealWithCook } from "@/lib/queries";
import { money } from "@/lib/format";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";

/** Sticky price + add button for phones, where the order panel sits far down the page. */
export function MobileBuyBar({ meal }: { meal: MealWithCook }) {
  const soldOut = meal.portionsAvailable <= 0;
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/95 px-4 py-3 shadow-[0_-10px_30px_-20px_rgb(43_33_24/0.4)] backdrop-blur lg:hidden" style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
      <div className="mx-auto flex max-w-xl items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold">{meal.title}</p>
          <p className="text-xs text-ink-muted">
            <span className="font-display text-base font-bold text-ink">{money(meal.priceCents)}</span> · serves {meal.servings} · {soldOut ? "sold out" : `${meal.portionsAvailable} left`}
          </p>
        </div>
        <div className="w-44">
          <AddToCartButton meal={meal} disabled={soldOut} />
        </div>
      </div>
    </div>
  );
}
