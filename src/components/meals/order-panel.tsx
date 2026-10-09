"use client";

import { useState } from "react";
import type { MealWithCook } from "@/lib/queries";
import { money, FULFILLMENT_LABELS, nextAvailableDay } from "@/lib/format";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";

export function OrderPanel({ meal }: { meal: MealWithCook }) {
  const [qty, setQty] = useState(1);
  const soldOut = meal.portionsAvailable <= 0;
  const next = nextAvailableDay(meal.availableDays);
  const max = Math.min(10, meal.portionsAvailable);

  return (
    <div className="card sticky top-20 p-5">
      <div className="flex items-baseline justify-between">
        <span className="font-display text-3xl font-bold">{money(meal.priceCents)}</span>
        <span className="text-sm text-ink-muted">
          serves {meal.servings}
        </span>
      </div>
      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-ink-muted">Next available</dt>
          <dd className="font-bold">{next ?? "Not scheduled"}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-ink-muted">Ready window</dt>
          <dd className="font-bold">{meal.readyWindow}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-ink-muted">Portions left</dt>
          <dd className={`font-bold ${meal.portionsAvailable <= 3 ? "text-tomato" : ""}`}>{meal.portionsAvailable}</dd>
        </div>
      </dl>
      <div className="mt-4">
        <p className="label">Hand-off options</p>
        <ul className="space-y-1.5">
          {meal.fulfillment.map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm">
              <span className="mt-0.5 text-sage" aria-hidden>
                ✓
              </span>
              <span>
                <span className="font-bold">{FULFILLMENT_LABELS[f]?.label ?? f}.</span> <span className="text-ink-soft">{FULFILLMENT_LABELS[f]?.blurb}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
      {!soldOut && (
        <div className="mt-5 flex items-center gap-3">
          <span className="label mb-0">Qty</span>
          <div className="inline-flex items-center rounded-full ring-1 ring-line">
            <button type="button" className="px-3 py-1.5 text-lg font-bold text-ink-soft hover:text-ink" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">
              −
            </button>
            <span className="min-w-8 text-center text-sm font-bold" aria-live="polite">
              {qty}
            </span>
            <button type="button" className="px-3 py-1.5 text-lg font-bold text-ink-soft hover:text-ink" onClick={() => setQty((q) => Math.min(max, q + 1))} aria-label="Increase quantity">
              +
            </button>
          </div>
          <span className="ml-auto font-bold">{money(meal.priceCents * qty)}</span>
        </div>
      )}
      <div className="mt-4">
        <AddToCartButton meal={meal} qty={qty} disabled={soldOut} />
      </div>
      <p className="mt-3 text-center text-xs text-ink-muted">Pay at checkout. Cancel free until the cook starts cooking.</p>
    </div>
  );
}
