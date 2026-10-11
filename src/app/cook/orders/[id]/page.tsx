import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireCook } from "@/lib/auth";
import { getOrder, listMessages } from "@/lib/queries";
import { markThreadRead } from "@/lib/actions/messages";
import { OrderThread } from "@/components/messages/order-thread";
import { OrderActions } from "@/components/cook/order-actions";
import { Avatar } from "@/components/avatar";
import { money, timeAgo, FULFILLMENT_LABELS } from "@/lib/format";
import { STATUS_LABELS } from "@/lib/order-status";
import { COOK_SHARE } from "@/lib/pricing";

export const metadata: Metadata = { title: "Order" };

export default async function CookOrderPage(props: PageProps<"/cook/orders/[id]">) {
  const { id } = await props.params;
  const cook = await requireCook();
  const order = await getOrder(id);
  if (!order || order.cookId !== cook.id) notFound();
  await markThreadRead(order.id);
  const messages = await listMessages(order.id);

  return (
    <div>
      <nav className="mb-4 text-sm text-ink-muted" aria-label="Breadcrumb">
        <Link href="/cook" className="hover:text-tomato">
          Orders
        </Link>{" "}
        / Order {order.id.slice(-6).toUpperCase()}
      </nav>
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="card p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <Avatar name={order.customer.name} hue={order.customer.avatarHue} size={44} />
              <div>
                <p className="text-lg font-bold">{order.customer.name}</p>
                <p className="text-xs text-ink-muted">
                  {order.customer.neighborhood} · {timeAgo(order.createdAt)} · {FULFILLMENT_LABELS[order.fulfillment]?.label} · {order.scheduledFor}
                </p>
              </div>
            </div>
            <span className="chip bg-butter-soft text-ink">{STATUS_LABELS[order.status]}</span>
          </div>
          <ul className="mt-4 divide-y divide-line">
            {order.items.map((it) => (
              <li key={it.id} className="flex justify-between py-2 text-sm">
                <span>
                  <span className="font-bold">{it.qty}×</span> {it.title}
                </span>
                <span>{money(it.qty * it.unitCents)}</span>
              </li>
            ))}
          </ul>
          {order.address && (
            <p className="mt-3 text-sm">
              <span className="font-bold">Address:</span> {order.address}
            </p>
          )}
          {order.customer.phone && (
            <p className="text-sm">
              <span className="font-bold">Phone:</span> {order.customer.phone}
            </p>
          )}
          {order.note && <p className="mt-2 rounded-xl bg-cream-deep p-3 text-sm italic text-ink-soft">“{order.note}”</p>}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm">
              You earn <span className="font-bold">{money(Math.round(order.subtotalCents * COOK_SHARE) + order.tipCents)}</span>
            </p>
            <OrderActions orderId={order.id} fulfillment={order.fulfillment} status={order.status} />
          </div>
        </div>
        <OrderThread orderId={order.id} messages={messages} meId={cook.userId} otherName={order.customer.name.split(" ")[0]} placeholder="e.g. Cooler is on the left side of the porch" />
      </div>
    </div>
  );
}
