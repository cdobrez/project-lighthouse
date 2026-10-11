"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setStandingOrderStatus } from "@/lib/actions/subscriptions";
import { FULFILLMENT_LABELS, money } from "@/lib/format";
import type { SubscriptionFull } from "@/lib/queries";

export function StandingOrderList({ subs }: { subs: SubscriptionFull[] }) {
  const [pending, start] = useTransition();
  const router = useRouter();
  const set = (id: string, status: "active" | "paused" | "cancelled") =>
    start(async () => {
      await setStandingOrderStatus(id, status);
      router.refresh();
    });
  if (!subs.length) return <p className="card p-6 text-sm text-ink-soft">No weekly orders yet. Find a dish you love and tap “Make it weekly”.</p>;
  return (
    <ul className="card divide-y divide-line">
      {subs.map((s) => (
        <li key={s.id} className={`flex flex-wrap items-center justify-between gap-3 p-4 ${s.status === "paused" ? "opacity-70" : ""}`}>
          <div className="min-w-0">
            <p className="font-bold">
              <Link href={`/meals/${s.meal.slug}`} className="hover:text-tomato">
                {s.qty}× {s.meal.title}
              </Link>{" "}
              <span className="font-normal text-ink-soft">every {s.day}</span>
            </p>
            <p className="text-xs text-ink-muted">
              {s.cook.displayName} · {FULFILLMENT_LABELS[s.fulfillment]?.label} · about {money(s.meal.priceCents * s.qty)} a week
              {s.lastOrderedOn && ` · last placed ${s.lastOrderedOn}`}
            </p>
          </div>
          <div className="flex gap-1">
            {s.status === "active" ? (
              <button type="button" className="btn-secondary px-3 py-1 text-xs" disabled={pending} onClick={() => set(s.id, "paused")}>
                Pause
              </button>
            ) : (
              <button type="button" className="btn-secondary px-3 py-1 text-xs" disabled={pending} onClick={() => set(s.id, "active")}>
                Resume
              </button>
            )}
            <button type="button" className="btn-ghost px-3 py-1 text-xs" disabled={pending} onClick={() => set(s.id, "cancelled")}>
              Cancel
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
