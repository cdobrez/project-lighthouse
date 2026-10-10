import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { adminOverview } from "@/lib/queries";
import { Section } from "@/components/section";
import { IssueActions } from "@/components/admin/issue-actions";
import { CookToggle } from "@/components/admin/cook-toggle";
import { money, timeAgo } from "@/lib/format";
import { STATUS_LABELS } from "@/lib/order-status";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin", robots: { index: false } };

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (user.role !== "admin") redirect("/");
  const { totals, recentOrders, issues, waitlist, cooks, byNeighborhood } = await adminOverview();

  return (
    <Section className="py-10">
      <p className="eyebrow mb-2">Admin</p>
      <h1 className="text-4xl font-bold tracking-tight">How the neighborhood is doing</h1>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Food sold (GMV)" value={money(totals.gmvCents)} />
        <Stat label="Platform revenue" value={money(totals.feesCents)} hint="fees + delivery" />
        <Stat label="Orders" value={String(totals.orders)} />
        <Stat label="Neighbors" value={String(totals.users)} hint={`${totals.cooks} cooks · ${totals.meals} meals`} />
        <Stat label="Open problems" value={String(totals.openIssues)} tone={totals.openIssues ? "warn" : undefined} />
        <Stat label="Waitlist" value={String(totals.waitlist)} hint="people in new areas" />
        {byNeighborhood.map((n) => (
          <Stat key={n.neighborhood} label={n.neighborhood} value={money(Number(n.gmv))} hint={`${n.orders} orders`} />
        ))}
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="text-xl font-bold">Reported problems</h2>
          <ul className="card mt-3 divide-y divide-line">
            {issues.length === 0 && <li className="p-4 text-sm text-ink-soft">Nothing reported. Nice.</li>}
            {issues.map((i) => (
              <li key={i.issue.id} className="flex flex-wrap items-center justify-between gap-2 p-3 text-sm">
                <span className="min-w-0">
                  <span className="font-bold">{i.customer}</span> · {i.cook} · <span className="font-bold">{i.issue.kind.replace(/_/g, " ")}</span>
                  {i.issue.details && <span className="block text-xs text-ink-soft">“{i.issue.details}”</span>}
                  <span className="block text-xs text-ink-muted">
                    <Link href={`/orders/${i.issue.orderId}`} className="hover:underline">
                      order
                    </Link>{" "}
                    · {timeAgo(i.issue.createdAt)}
                  </span>
                </span>
                {i.issue.status === "open" ? <IssueActions issueId={i.issue.id} /> : <span className="chip">{i.issue.status}</span>}
              </li>
            ))}
          </ul>

          <h2 className="mt-8 text-xl font-bold">Waitlist</h2>
          <ul className="card mt-3 divide-y divide-line">
            {waitlist.length === 0 && <li className="p-4 text-sm text-ink-soft">No sign-ups yet.</li>}
            {waitlist.map((w) => (
              <li key={w.id} className="p-3 text-sm">
                <span className="font-bold">{w.email}</span> · {w.zip}
                {w.neighborhood && ` · ${w.neighborhood}`}
                {w.wantsToCook && <span className="chip ml-2 bg-butter-soft text-ink">wants to cook</span>}
                {w.note && <span className="block text-xs text-ink-soft">“{w.note}”</span>}
                <span className="block text-xs text-ink-muted">{timeAgo(w.createdAt)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-bold">Recent orders</h2>
          <ul className="card mt-3 divide-y divide-line">
            {recentOrders.map((o) => (
              <li key={o.id} className="flex items-center justify-between gap-3 p-3 text-sm">
                <span className="min-w-0 truncate">
                  <span className="font-bold">{o.customer.name}</span> → {o.cook.displayName}: {o.items.map((i) => `${i.qty}× ${i.title}`).join(", ")}
                  <span className="block text-xs text-ink-muted">
                    {o.fulfillment} · {timeAgo(o.createdAt)}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  <span className="chip">{STATUS_LABELS[o.status]}</span>
                  <span className="font-bold">{money(o.totalCents)}</span>
                </span>
              </li>
            ))}
          </ul>

          <h2 className="mt-8 text-xl font-bold">Kitchens</h2>
          <ul className="card mt-3 divide-y divide-line">
            {cooks.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-3 p-3 text-sm">
                <span className="min-w-0 truncate">
                  <Link href={`/cooks/${c.slug}`} className="font-bold hover:text-tomato">
                    {c.displayName}
                  </Link>{" "}
                  · {c.neighborhood} · {c.ratingCount ? `${c.ratingAvg.toFixed(1)} ★` : "new"}
                  {!c.foodHandlerCertified && <span className="chip ml-2 bg-tomato-soft text-tomato-deep">no certificate</span>}
                  {!c.active && <span className="chip ml-2">paused</span>}
                </span>
                <CookToggle cookId={c.id} active={c.active} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}

function Stat({ label, value, hint, tone }: { label: string; value: string; hint?: string; tone?: "warn" }) {
  return (
    <div className={`card p-4 ${tone === "warn" ? "bg-tomato-soft/40" : ""}`}>
      <p className="text-xs font-extrabold uppercase tracking-wider text-ink-muted">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold">{value}</p>
      {hint && <p className="text-xs text-ink-muted">{hint}</p>}
    </div>
  );
}
