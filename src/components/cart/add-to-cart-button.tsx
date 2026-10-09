"use client";

import { useState } from "react";
import { useCart } from "./cart-provider";
import type { MealWithCook } from "@/lib/queries";

type Props = { meal: MealWithCook; compact?: boolean; disabled?: boolean; qty?: number };

export function AddToCartButton({ meal, compact = false, disabled = false, qty = 1 }: Props) {
  const { add } = useCart();
  const [state, setState] = useState<"idle" | "added" | "error">("idle");
  const [message, setMessage] = useState("");

  function handle() {
    const result = add(
      {
        mealId: meal.id,
        slug: meal.slug,
        title: meal.title,
        unitCents: meal.priceCents,
        cookId: meal.cookId,
        cookName: meal.cook.displayName,
        cookSlug: meal.cook.slug,
        imageKey: meal.imageKey,
        cuisine: meal.cuisine,
        fulfillment: meal.fulfillment,
        readyWindow: meal.readyWindow,
      },
      qty
    );
    if (result.ok) {
      setState("added");
      setMessage("");
      setTimeout(() => setState("idle"), 1600);
    } else {
      setState("error");
      setMessage(result.reason ?? "Could not add to basket.");
    }
  }

  return (
    <div className={compact ? "" : "w-full"}>
      <button
        type="button"
        onClick={handle}
        disabled={disabled}
        className={`${compact ? "btn-secondary px-3.5" : "btn-primary w-full py-3 text-base"} ${state === "added" ? "!bg-sage !text-white" : ""}`}
        aria-live="polite"
      >
        {state === "added" ? (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M20 6L9 17l-5-5" />
            </svg>
            Added
          </>
        ) : disabled ? (
          "Sold out"
        ) : compact ? (
          "+ Add"
        ) : (
          `Add ${qty > 1 ? `${qty} ` : ""}to basket`
        )}
      </button>
      {state === "error" && message && <p className="mt-2 text-xs font-semibold text-tomato-deep">{message}</p>}
    </div>
  );
}
