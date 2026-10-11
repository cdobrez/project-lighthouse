import type { Metadata } from "next";
import { requireCook } from "@/lib/auth";
import { listOrdersForCook } from "@/lib/queries";
import { money } from "@/lib/format";
import { isFinal } from "@/lib/order-status";
import { COOK_SHARE } from "@/lib/pricing";

export const metadata: Metadata = { title: "Earnings" };

function weekKey(iso: string): string {
  const d = new Date(iso.includes("T") ? iso : iso.replace(" ", "T") + "Z");
  const day = (d.getUTCDay() + 6) % 7;
  const monday = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - day));
  return monday.toISOString().slice(0, 10);
}

export default async function EarningsPage() {
  const cook = await requireCook();
  const orders = await listOrdersForCook(cook.id);
  const paid = orders.filter((o) => o.status !== "cancelled" && o.status !== "pending_payment");
  const completed = paid.filter((o) => isFinal(o.fulfillment, o.status));
  const earn = (o: (typeof orders)[number]) => Math.round(o.subtotalCents * COOK_SHARE) + o.tipCents;

  const byWeek = new Map<string, { orders: number; portions: number; food: number; tips: number; take: number }>();
  for (const o of paid) {
    const k = weekKey(o.createdAt);
    const w = byWeek.get(k) ?? { orders: 0, portions: 0, food: 0, tips: 0, take: 0 };
    w.orders += 1;
    w.portions += o.items.reduce((a, i) => a + i.qty, 0);
    w.food += o.subtotalCents;
    w.tips += o.tipCents;
    w.take += earn(o);
    byWeek.set(k, w);
  }
  const weeks = [...byWeek.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1));

  const byMeal = new Map<string, { title: string; portions: number; take: number }>();
  for (const o of paid)
    for (const it of o.items) {
      const m = byMeal.get(it.mealId) ?? { title: it.title, portions: 0, take: 0 };
      m.portions += it.qty;
      m.take += Math.round(it.qty * it.unitCents * COOK_SHARE);
      byMeal.set(it.mealId, m);
    }
  const topMeals = [...byMeal.values()].sort((a, b) => b.take - a.take).slice(0, 6);

  const lifetime = completed.reduce((a, o) => a + earn(o), 0);
  const upcoming = paid.filter((o) => !isFinal(o.fulfillment, o.status)).reduce((a, o) => a + earn(o), 0);
  const tips = completed.reduce((a, o) => a + o.tipCents, 0);

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Earned so far" value={money(lifetime)} hint={`${completed.length} completed orders`} />
        <Stat label="In progress" value={money(upcoming)} hint="orders not yet handed off" />
        <Stat label="Tips" value={money(tips)} hint="100% yours" />
      </div>
      <p className="mt-3 text-xs text-ink-muted">You keep {Math.round(COOK_SHARE * 100)}% of the food price plus every tip. Payouts land weekly once Stripe is connected.</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <h2 className="text-xl font-bold">By week</h2>
          <div className="card mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wider text-ink-muted">
                <tr>
                  <th className="p-3">Week of</th>
                  <th className="p-3">Orders</th>
                  <th className="p-3">Portions</th>
                  <th className="p-3">Food</th>
                  <th className="p-3">Tips</th>
                  <th className="p-3 text-right">Your take</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {weeks.length === 0 && (
                  <tr>
                    <td className="p-3 text-ink-soft" colSpan={6}>
                      No paid orders yet.
                    </td>
                  </tr>
                )}
                {weeks.map(([k, w]) => (
                  <tr key={k}>
                    <td className="p-3 font-bold">{k}</td>
                    <td className="p-3">{w.orders}</td>
                    <td className="p-3">{w.portions}</td>
                    <td className="p-3">{money(w.food)}</td>
                    <td className="p-3">{money(w.tips)}</td>
                    <td className="p-3 text-right font-bold">{money(w.take)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <h2 className="text-xl font-bold">Best sellers</h2>
          <ul className="card mt-3 divide-y divide-line">
            {topMeals.length === 0 && <li className="p-3 text-sm text-ink-soft">Nothing sold yet.</li>}
            {topMeals.map((m) => (
              <li key={m.title} className="flex items-center justify-between p-3 text-sm">
                <span>
                  <span className="font-bold">{m.title}</span>
                  <span className="block text-xs text-ink-muted">{m.portions} portions</span>
                </span>
                <span className="font-bold">{money(m.take)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
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
