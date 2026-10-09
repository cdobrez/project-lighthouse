"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { useCart } from "./cart-provider";
import { placeOrder } from "@/lib/actions/orders";
import { SERVICE_FEE_RATE, DELIVERY_FEE_CENTS } from "@/lib/pricing";
import { money, FULFILLMENT_LABELS } from "@/lib/format";
import { Photo } from "@/components/photo";

type Fulfillment = "pickup" | "dropoff" | "delivery";

export function CheckoutForm({ user }: { user: { name: string; address: string; neighborhood: string; phone: string } }) {
  const { lines, subtotalCents, clear, hydrated } = useCart();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const options = useMemo(() => {
    if (!lines.length) return [] as Fulfillment[];
    return (["pickup", "dropoff", "delivery"] as Fulfillment[]).filter((f) => lines.every((l) => l.fulfillment.includes(f)));
  }, [lines]);

  const [fulfillment, setFulfillment] = useState<Fulfillment | "">("");
  const chosen: Fulfillment = (fulfillment || options[0] || "pickup") as Fulfillment;
  const [address, setAddress] = useState(user.address);
  const [when, setWhen] = useState("Tonight");
  const [note, setNote] = useState("");
  const [tip, setTip] = useState(0);
  const [card, setCard] = useState({ number: "4242 4242 4242 4242", exp: "12/28", cvc: "123" });

  const fee = Math.round(subtotalCents * SERVICE_FEE_RATE);
  const delivery = chosen === "delivery" ? DELIVERY_FEE_CENTS : 0;
  const tipCents = Math.round(subtotalCents * tip);
  const total = subtotalCents + fee + delivery + tipCents;

  if (!hydrated) return <div className="card h-40 animate-pulse" />;
  if (!lines.length) {
    return (
      <div className="card p-10 text-center">
        <h2 className="text-xl font-bold">Nothing to check out yet</h2>
        <Link href="/meals" className="btn-primary mt-4">
          Browse meals
        </Link>
      </div>
    );
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const result = await placeOrder({
        items: lines.map((l) => ({ mealId: l.mealId, qty: l.qty })),
        fulfillment: chosen,
        address,
        scheduledFor: `${when} · ${lines[0].readyWindow}`,
        note,
        tipCents,
      });
      if (result.ok) {
        clear();
        router.push(`/orders/${result.orderId}?placed=1`);
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <form onSubmit={submit} className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <div className="space-y-6">
        <fieldset className="card p-5">
          <legend className="sr-only">Hand-off method</legend>
          <p className="text-lg font-bold">1. Hand-off</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {(["pickup", "dropoff", "delivery"] as Fulfillment[]).map((f) => {
              const available = options.includes(f);
              return (
                <label
                  key={f}
                  className={`cursor-pointer rounded-2xl border-2 p-3 text-sm transition-colors ${chosen === f ? "border-tomato bg-tomato-soft/40" : "border-line hover:border-ink-muted"} ${!available ? "cursor-not-allowed opacity-40" : ""}`}
                >
                  <input type="radio" name="fulfillment" value={f} className="sr-only" checked={chosen === f} disabled={!available} onChange={() => setFulfillment(f)} />
                  <span className="block font-bold">{FULFILLMENT_LABELS[f].label}</span>
                  <span className="block text-xs text-ink-soft">{FULFILLMENT_LABELS[f].blurb}</span>
                  <span className="mt-1 block text-xs font-bold text-ink-muted">{f === "delivery" ? `+${money(DELIVERY_FEE_CENTS)}` : "Free"}</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="card p-5">
          <p className="text-lg font-bold">2. When &amp; where</p>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="when">
                Day
              </label>
              <select id="when" className="input" value={when} onChange={(e) => setWhen(e.target.value)}>
                {["Tonight", "Tomorrow", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
              <p className="mt-1 text-xs text-ink-muted">Ready window: {lines[0].readyWindow}</p>
            </div>
            {chosen !== "pickup" ? (
              <div>
                <label className="label" htmlFor="address">
                  {chosen === "dropoff" ? "Drop-off address" : "Delivery address"}
                </label>
                <input id="address" className="input" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Elm St" required />
              </div>
            ) : (
              <div className="rounded-xl bg-cream-deep p-3 text-sm text-ink-soft">
                The cook&apos;s porch address is shared the moment they accept your order.
              </div>
            )}
          </div>
          <label className="label mt-4" htmlFor="note">
            Note for the cook (optional)
          </label>
          <textarea id="note" className="input" rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Go easy on the chili, please. Side gate is open." maxLength={500} />
        </div>

        <div className="card p-5">
          <p className="text-lg font-bold">3. Payment</p>
          <p className="mt-1 text-xs text-ink-muted">Demo checkout: no card is charged. Any number works.</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_120px_100px]">
            <div>
              <label className="label" htmlFor="card">
                Card number
              </label>
              <input id="card" className="input" inputMode="numeric" value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value })} required />
            </div>
            <div>
              <label className="label" htmlFor="exp">
                Expiry
              </label>
              <input id="exp" className="input" value={card.exp} onChange={(e) => setCard({ ...card, exp: e.target.value })} required />
            </div>
            <div>
              <label className="label" htmlFor="cvc">
                CVC
              </label>
              <input id="cvc" className="input" inputMode="numeric" value={card.cvc} onChange={(e) => setCard({ ...card, cvc: e.target.value })} required />
            </div>
          </div>
        </div>
      </div>

      <aside className="card h-fit p-5">
        <h2 className="text-lg font-bold">Your order</h2>
        <ul className="mt-3 divide-y divide-line">
          {lines.map((l) => (
            <li key={l.mealId} className="flex items-center gap-3 py-2.5">
              <span className="relative h-12 w-14 shrink-0 overflow-hidden rounded-lg bg-cream-deep">
                <Photo imageKey={l.imageKey} alt={l.title} fallbackLabel={l.cuisine} sizes="56px" />
              </span>
              <span className="min-w-0 flex-1 text-sm">
                <span className="block truncate font-bold">{l.title}</span>
                <span className="text-xs text-ink-muted">× {l.qty}</span>
              </span>
              <span className="text-sm font-bold">{money(l.unitCents * l.qty)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3">
          <p className="label">Tip the cook</p>
          <div className="flex gap-1.5">
            {[0, 0.1, 0.15, 0.2].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTip(t)}
                className={`flex-1 rounded-full py-1.5 text-xs font-bold ${tip === t ? "bg-ink text-cream" : "bg-cream-deep text-ink-soft hover:bg-line"}`}
              >
                {t === 0 ? "None" : `${t * 100}%`}
              </button>
            ))}
          </div>
        </div>
        <dl className="mt-4 space-y-1.5 text-sm">
          <Row label="Subtotal" value={money(subtotalCents)} />
          <Row label="Neighborhood fee (8%)" value={money(fee)} />
          <Row label={chosen === "delivery" ? "Delivery" : "Hand-off"} value={delivery ? money(delivery) : "Free"} />
          {tipCents > 0 && <Row label="Tip" value={money(tipCents)} />}
          <div className="flex justify-between border-t border-line pt-2 text-base">
            <dt className="font-bold">Total</dt>
            <dd className="font-display text-xl font-bold">{money(total)}</dd>
          </div>
        </dl>
        {error && <p className="mt-3 rounded-xl bg-tomato-soft p-3 text-sm font-semibold text-tomato-deep">{error}</p>}
        <button type="submit" className="btn-primary mt-4 w-full py-3 text-base" disabled={pending}>
          {pending ? "Placing order…" : `Place order · ${money(total)}`}
        </button>
        <p className="mt-3 text-center text-xs text-ink-muted">
          Ordering as {user.name}. Cooks keep {100 - SERVICE_FEE_RATE * 100}% of the food price plus the full tip.
        </p>
      </aside>
    </form>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-ink-muted">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
