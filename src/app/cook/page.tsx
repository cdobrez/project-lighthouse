import type { Metadata } from "next";
import Link from "next/link";
import { requireCook } from "@/lib/auth";
import { listOrdersForCook, listIssuesForCook } from "@/lib/queries";
import { Avatar } from "@/components/avatar";
import { OrderActions } from "@/components/cook/order-actions";
import { money, timeAgo, FULFILLMENT_LABELS } from "@/lib/format";
import { STATUS_LABELS, isFinal } from "@/lib/order-status";
import { COOK_SHARE } from "@/lib/pricing";

export const metadata: Metadata = { title: "Cook dashboard" };

export default async function CookOrdersPage(props: PageProps<"/cook">) {
  const sp = await props.searchParams;
  const cook = await requireCook();
  const orders = await listOrdersForCook(cook.id);
  const issues = await listIssuesForCook(cook.id);
  const open = orders.filter((o) => !isFinal(o.fulfillment, o.status));
  const done = orders.filter((o) => isFinal(o.fulfillment, o.status));
  const earned = done.filter((o) => o.status !== "cancelled").reduce((a, o) => a + Math.round(o.subtotalCents * COOK_SHARE) + o.tipCents, 0);
  const pendingEarn = open.reduce((a, o) => a + Math.round(o.subtotalCents * COOK_SHARE) + o.tipCents, 0);

  return (
    <div>
      {sp.welcome === "1" && (
        <div className="mb-6 rounded-2xl bg-sage-soft p-5">
          <p className="font-display text-2xl font-bold text-sage">Your kitchen is open. Welcome to the block.</p>
          <p className="mt-1 text-sm text-ink-soft">
            Next step: list your first meal.{" "}
            <Link href="/cook/meals/new" className="font-bold text-tomato hover:underline">
              Add a meal →
            </Link>
          </p>
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-4">
        <Stat label="Open orders" value={String(open.length)} />
        <Stat label="Coming in" value={money(pendingEarn)} hint="your share incl. tips" />
        <Stat label="Earned (completed)" value={money(earned)} />
        <Stat label="Rating" value={cook.ratingCount ? `${cook.ratingAvg.toFixed(1)} ★` : "New"} hint={`${cook.ratingCount} ratings`} />
      </div>

      {issues.length > 0 && (
        <div className="mt-8 rounded-2xl border border-tomato/30 bg-tomato-soft/40 p-5">
          <h2 className="text-lg font-bold text-tomato-deep">Reported problems</h2>
          <ul className="mt-2 space-y-1 text-sm">
            {issues.map((i) => (
              <li key={i.issue.id}>
                <span className="font-bold">{i.customer}</span> reported <span className="font-bold">{i.issue.kind.replace(/_/g, " ")}</span>
                {i.issue.details && <span className="text-ink-soft"> · “{i.issue.details}”</span>}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-ink-muted">Gig Kitchens follows up with the neighbor. A quick note from you goes a long way.</p>
        </div>
      )}
      <h2 className="mt-8 text-xl font-bold">Needs your attention</h2>
      {open.length === 0 ? (
        <p className="card mt-3 p-6 text-sm text-ink-soft">No open orders. Share your public page with the neighborhood or add another meal.</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {open.map((o) => (
            <li key={o.id} className="card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar name={o.customer.name} hue={o.customer.avatarHue} size={40} />
                  <div>
                    <p className="font-bold">
                      {o.customer.name} <span className="text-xs font-normal text-ink-muted">· {o.customer.neighborhood}</span>
                    </p>
                    <p className="text-xs text-ink-muted">
                      {timeAgo(o.createdAt)} · {FULFILLMENT_LABELS[o.fulfillment]?.label} · {o.scheduledFor}
                    </p>
                  </div>
                </div>
                <span className="chip bg-butter-soft text-ink">{STATUS_LABELS[o.status]}</span>
              </div>
              <ul className="mt-3 text-sm">
                {o.items.map((it) => (
                  <li key={it.id}>
                    <span className="font-bold">{it.qty}×</span> {it.title}
                  </li>
                ))}
              </ul>
              {o.address && (
                <p className="mt-2 text-sm text-ink-soft">
                  <span className="font-bold text-ink">Address:</span> {o.address}
                </p>
              )}
              {o.note && <p className="mt-2 rounded-xl bg-cream-deep p-3 text-sm italic text-ink-soft">“{o.note}”</p>}
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm">
                  You earn <span className="font-bold">{money(Math.round(o.subtotalCents * COOK_SHARE) + o.tipCents)}</span>
                  {o.tipCents > 0 && <span className="text-ink-muted"> (incl. {money(o.tipCents)} tip)</span>}
                </p>
                <OrderActions orderId={o.id} fulfillment={o.fulfillment} status={o.status} />
              </div>
            </li>
          ))}
        </ul>
      )}

      {done.length > 0 && (
        <>
          <h2 className="mt-10 text-xl font-bold">Completed</h2>
          <ul className="card mt-3 divide-y divide-line">
            {done.slice(0, 20).map((o) => (
              <li key={o.id} className="flex items-center justify-between gap-3 p-3 text-sm">
                <span className="truncate">
                  <span className="font-bold">{o.customer.name}</span> · {o.items.map((i) => `${i.qty}× ${i.title}`).join(", ")}
                </span>
                <span className="flex shrink-0 items-center gap-3">
                  <span className="chip">{STATUS_LABELS[o.status]}</span>
                  <span className="font-bold">{money(o.subtotalCents)}</span>
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="card p-4">
      <p className="text-xs font-extrabold uppercase tracking-wider text-ink-muted">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold">{value}</p>
      {hint && <p className="text-xs text-ink-muted">{hint}</p>}
    </div>
  );
}
