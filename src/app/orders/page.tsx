import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { listOrdersForUser } from "@/lib/queries";
import { Section } from "@/components/section";
import { Photo } from "@/components/photo";
import { money, timeAgo } from "@/lib/format";
import { STATUS_LABELS, isFinal } from "@/lib/order-status";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Your orders" };

export default async function OrdersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/orders");
  const orders = await listOrdersForUser(user.id);
  const active = orders.filter((o) => !isFinal(o.fulfillment, o.status));
  const past = orders.filter((o) => isFinal(o.fulfillment, o.status));

  return (
    <Section className="py-10">
      <p className="eyebrow mb-2">Your orders</p>
      <h1 className="text-4xl font-bold tracking-tight">Dinner, past and present</h1>
      {orders.length === 0 && (
        <div className="card mt-8 p-10 text-center">
          <p className="text-4xl" aria-hidden>
            🍲
          </p>
          <h2 className="mt-3 text-xl font-bold">No orders yet</h2>
          <Link href="/meals" className="btn-primary mt-4">
            See tonight&apos;s meals
          </Link>
        </div>
      )}
      {active.length > 0 && (
        <>
          <h2 className="mt-8 text-xl font-bold">In progress</h2>
          <OrderList orders={active} />
        </>
      )}
      {past.length > 0 && (
        <>
          <h2 className="mt-10 text-xl font-bold">Past orders</h2>
          <OrderList orders={past} />
        </>
      )}
    </Section>
  );
}

function OrderList({ orders }: { orders: Awaited<ReturnType<typeof listOrdersForUser>> }) {
  return (
    <ul className="mt-3 grid gap-4 md:grid-cols-2">
      {orders.map((o) => (
        <li key={o.id} className="card overflow-hidden">
          <Link href={`/orders/${o.id}`} className="flex gap-4 p-4 hover:bg-cream-deep/40">
            <span className="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-cream-deep">
              <Photo imageKey={o.items[0]?.imageKey ?? "meal-default"} alt="" fallbackLabel={o.items[0]?.cuisine} sizes="96px" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-start justify-between gap-2">
                <span className="truncate font-bold">{o.items.map((i) => `${i.qty}× ${i.title}`).join(", ")}</span>
                <span className="shrink-0 font-display font-bold">{money(o.totalCents)}</span>
              </span>
              <span className="block text-sm text-ink-soft">
                {o.cook.displayName} · {o.scheduledFor}
              </span>
              <span className="mt-2 flex items-center gap-2 text-xs">
                <span className={`chip ${o.status === "cancelled" ? "" : isFinal(o.fulfillment, o.status) ? "bg-sage-soft text-sage" : "bg-butter-soft text-ink"}`}>
                  {STATUS_LABELS[o.status] ?? o.status}
                </span>
                <span className="text-ink-muted">{timeAgo(o.createdAt)}</span>
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
