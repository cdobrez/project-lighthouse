"use client";

import { useActionState, useState } from "react";
import { createStandingOrder } from "@/lib/actions/subscriptions";
import { FULFILLMENT_LABELS } from "@/lib/format";

type Props = {
  mealId: string;
  mealTitle: string;
  days: string[];
  fulfillment: string[];
  defaultDay?: string;
  defaultQty?: number;
  defaultFulfillment?: string;
  defaultAddress?: string;
  signedIn: boolean;
  loginHref: string;
};

export function StandingOrderForm(p: Props) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(createStandingOrder, undefined);
  const [fulfillment, setFulfillment] = useState(p.defaultFulfillment && p.fulfillment.includes(p.defaultFulfillment) ? p.defaultFulfillment : p.fulfillment[0] ?? "pickup");

  if (state?.ok) {
    return (
      <div className="rounded-2xl bg-sage-soft p-4 text-sm">
        <p className="font-bold text-sage">Weekly order set.</p>
        <p className="text-ink-soft">We place it for you each week in the morning and you&apos;ll get the usual updates. Pause or cancel any time from your account.</p>
      </div>
    );
  }

  if (!open) {
    return (
      <button type="button" className="btn-secondary w-full" onClick={() => setOpen(true)}>
        🔁 Make it weekly
      </button>
    );
  }

  if (!p.signedIn) {
    return (
      <div className="card p-4 text-sm">
        <p className="font-bold">Same dish, same night, every week.</p>
        <a href={p.loginHref} className="btn-primary mt-3">
          Sign in to set it up
        </a>
      </div>
    );
  }

  return (
    <form action={action} className="card space-y-3 p-4 text-sm">
      <input type="hidden" name="mealId" value={p.mealId} />
      <p className="font-bold">{p.mealTitle}, every week</p>
      <div className="grid grid-cols-2 gap-2">
        <label>
          <span className="label">Day</span>
          <select name="day" className="input" defaultValue={p.defaultDay && p.days.includes(p.defaultDay) ? p.defaultDay : p.days[0]}>
            {p.days.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="label">Portions</span>
          <input name="qty" type="number" min={1} max={10} className="input" defaultValue={p.defaultQty ?? 1} />
        </label>
      </div>
      <label>
        <span className="label">Hand-off</span>
        <select name="fulfillment" className="input" value={fulfillment} onChange={(e) => setFulfillment(e.target.value)}>
          {p.fulfillment.map((f) => (
            <option key={f} value={f}>
              {FULFILLMENT_LABELS[f]?.label ?? f}
            </option>
          ))}
        </select>
      </label>
      {fulfillment !== "pickup" && (
        <label>
          <span className="label">Address</span>
          <input name="address" className="input" defaultValue={p.defaultAddress ?? ""} placeholder="123 Elm St" required />
        </label>
      )}
      <label>
        <span className="label">Tip for the cook</span>
        <select name="tipPercent" className="input" defaultValue="10">
          <option value="0">No tip</option>
          <option value="10">10%</option>
          <option value="15">15%</option>
          <option value="20">20%</option>
        </select>
      </label>
      {state?.error && <p className="font-semibold text-tomato-deep">{state.error}</p>}
      <div className="flex gap-2">
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? "Saving…" : "Start weekly order"}
        </button>
        <button type="button" className="btn-ghost" onClick={() => setOpen(false)}>
          Cancel
        </button>
      </div>
      <p className="text-xs text-ink-muted">Placed automatically each week in the morning while portions last. Skip a week by pausing from your account.</p>
    </form>
  );
}
