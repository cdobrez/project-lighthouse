"use client";

import Link from "next/link";
import { useCart } from "./cart-provider";
import { Photo } from "@/components/photo";
import { money } from "@/lib/format";

export function CartView() {
  const { lines, setQty, remove, clear, subtotalCents, hydrated } = useCart();

  if (!hydrated) return <div className="card h-40 animate-pulse" />;

  if (lines.length === 0) {
    return (
      <div className="card p-10 text-center">
        <p className="text-5xl" aria-hidden>
          🧺
        </p>
        <h2 className="mt-3 text-xl font-bold">Your basket is empty</h2>
        <p className="mt-2 text-sm text-ink-soft">Someone a few streets away is cooking right now.</p>
        <Link href="/meals" className="btn-primary mt-5">
          See tonight&apos;s meals
        </Link>
      </div>
    );
  }

  const cook = lines[0];

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="card divide-y divide-line">
        <div className="flex items-center justify-between p-4">
          <p className="text-sm">
            Cooked by{" "}
            <Link href={`/cooks/${cook.cookSlug}`} className="font-bold text-ink hover:text-tomato">
              {cook.cookName}
            </Link>
          </p>
          <button type="button" onClick={clear} className="text-xs font-bold text-ink-muted hover:text-tomato">
            Clear basket
          </button>
        </div>
        {lines.map((l) => (
          <div key={l.mealId} className="flex gap-4 p-4">
            <Link href={`/meals/${l.slug}`} className="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-cream-deep">
              <Photo imageKey={l.imageKey} alt={l.title} fallbackLabel={l.cuisine} sizes="96px" />
            </Link>
            <div className="min-w-0 flex-1">
              <Link href={`/meals/${l.slug}`} className="font-bold hover:text-tomato">
                {l.title}
              </Link>
              <p className="text-xs text-ink-muted">
                {money(l.unitCents)} each · ready {l.readyWindow}
              </p>
              <div className="mt-2 flex items-center gap-3">
                <div className="inline-flex items-center rounded-full ring-1 ring-line">
                  <button type="button" className="px-3 py-1 font-bold text-ink-soft" onClick={() => setQty(l.mealId, l.qty - 1)} aria-label={`Decrease ${l.title}`}>
                    −
                  </button>
                  <span className="min-w-6 text-center text-sm font-bold">{l.qty}</span>
                  <button type="button" className="px-3 py-1 font-bold text-ink-soft" onClick={() => setQty(l.mealId, l.qty + 1)} aria-label={`Increase ${l.title}`}>
                    +
                  </button>
                </div>
                <button type="button" onClick={() => remove(l.mealId)} className="text-xs font-bold text-ink-muted hover:text-tomato">
                  Remove
                </button>
              </div>
            </div>
            <span className="font-display text-lg font-bold">{money(l.unitCents * l.qty)}</span>
          </div>
        ))}
      </div>
      <aside className="card h-fit p-5">
        <h2 className="text-lg font-bold">Summary</h2>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-ink-muted">Subtotal</dt>
            <dd className="font-bold">{money(subtotalCents)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-muted">Neighborhood fee (8%)</dt>
            <dd>{money(Math.round(subtotalCents * 0.08))}</dd>
          </div>
          <div className="flex justify-between text-ink-muted">
            <dt>Delivery</dt>
            <dd>calculated at checkout</dd>
          </div>
        </dl>
        <Link href="/checkout" className="btn-primary mt-5 w-full py-3 text-base">
          Continue to checkout
        </Link>
        <Link href={`/cooks/${cook.cookSlug}`} className="btn-ghost mt-2 w-full">
          Add more from {cook.cookName.split(" ")[0]}
        </Link>
      </aside>
    </div>
  );
}
