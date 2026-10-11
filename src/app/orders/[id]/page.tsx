import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getOrder, userHasReviewed, getIssueForOrder } from "@/lib/queries";
import { ReportIssue } from "@/components/orders/report-issue";
import { Section } from "@/components/section";
import { Photo } from "@/components/photo";
import { StatusTimeline } from "@/components/orders/status-timeline";
import { CancelOrderButton } from "@/components/orders/cancel-order-button";
import { ReviewForm } from "@/components/reviews/review-form";
import { money, FULFILLMENT_LABELS } from "@/lib/format";
import { STATUS_LABELS, isFinal, isPending } from "@/lib/order-status";
import { verifyCheckoutSession } from "@/lib/actions/orders";
import { PayNowButton } from "@/components/orders/pay-now-button";
import { OrderThread } from "@/components/messages/order-thread";
import { StandingOrderForm } from "@/components/subscriptions/standing-order-form";
import { getMealsByIds } from "@/lib/queries";
import { listMessages } from "@/lib/queries";
import { markThreadRead } from "@/lib/actions/messages";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Order details" };

export default async function OrderPage(props: PageProps<"/orders/[id]">) {
  const { id } = await props.params;
  const sp = await props.searchParams;
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/orders/${id}`);
  let order = await getOrder(id);
  if (!order || order.userId !== user.id) notFound();
  if (sp.paid === "1" && typeof sp.session_id === "string" && isPending(order.status)) {
    if (await verifyCheckoutSession(order.id, sp.session_id)) order = (await getOrder(id)) ?? order;
  }
  const justPlaced = sp.placed === "1" || (sp.paid === "1" && !isPending(order.status));
  const pending = isPending(order.status);
  const done = isFinal(order.fulfillment, order.status) && order.status !== "cancelled";
  const issue = await getIssueForOrder(order.id);
  await markThreadRead(order.id);
  const messages = order.status === "cancelled" ? [] : await listMessages(order.id);
  const myReviews = done ? await Promise.all(order.items.map((it) => userHasReviewed(user.id, it.mealId))) : [];
  const orderMeals = done ? await getMealsByIds(order.items.map((it) => it.mealId)) : [];

  return (
    <Section className="py-10">
      {justPlaced && (
        <div className="mb-6 rounded-2xl bg-sage-soft p-5">
          <p className="font-display text-2xl font-bold text-sage">Order placed. {order.cook.displayName.split("'")[0]} has been pinged.</p>
          <p className="mt-1 text-sm text-ink-soft">
            You&apos;ll see the status move here as the cook accepts, cooks, and hands it off. No need to refresh your inbox.
          </p>
        </div>
      )}
      {pending && (
        <div className="mb-6 rounded-2xl bg-butter-soft p-5">
          <p className="font-display text-2xl font-bold">One more step: payment</p>
          <p className="mt-1 text-sm text-ink-soft">
            {sp.cancelled === "1" ? "The payment screen was closed before finishing. " : ""}Your portions are reserved. Finish paying and {order.cook.displayName} gets the order.
          </p>
          <div className="mt-3">
            <PayNowButton orderId={order.id} />
          </div>
        </div>
      )}
      <nav className="mb-4 text-sm text-ink-muted" aria-label="Breadcrumb">
        <Link href="/orders" className="hover:text-tomato">
          Your orders
        </Link>{" "}
        / <span className="text-ink">Order {order.id.slice(-6).toUpperCase()}</span>
      </nav>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{STATUS_LABELS[order.status] ?? order.status}</h1>
          <p className="mt-1 text-ink-soft">
            {FULFILLMENT_LABELS[order.fulfillment]?.label} · {order.scheduledFor}
          </p>
        </div>
        {["pending_payment", "placed", "accepted"].includes(order.status) && <CancelOrderButton orderId={order.id} />}
      </div>

      <div className="card mt-6 p-5">
        <StatusTimeline fulfillment={order.fulfillment} status={order.status} />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <div className="card divide-y divide-line">
            {order.items.map((it) => (
              <div key={it.id} className="flex items-center gap-4 p-4">
                <span className="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-cream-deep">
                  <Photo imageKey={it.imageKey} alt={it.title} fallbackLabel={it.cuisine} sizes="80px" />
                </span>
                <span className="min-w-0 flex-1">
                  <Link href={`/meals/${it.mealSlug}`} className="font-bold hover:text-tomato">
                    {it.title}
                  </Link>
                  <span className="block text-xs text-ink-muted">
                    {it.qty} × {money(it.unitCents)}
                  </span>
                </span>
                <span className="font-bold">{money(it.qty * it.unitCents)}</span>
              </div>
            ))}
          </div>

          {!pending && order.status !== "cancelled" && (
            <OrderThread orderId={order.id} messages={messages} meId={user.id} otherName={order.cook.displayName} placeholder="e.g. Can you leave it by the side door?" />
          )}

          {done && orderMeals.filter((m) => m.status === "active" && m.availableDays.length).length > 0 && (
            <div className="card p-5">
              <h2 className="text-xl font-bold">Loved it? Make it a weekly thing.</h2>
              <p className="mb-3 text-sm text-ink-soft">Same dish, same night, placed for you automatically. Pause whenever.</p>
              <div className="grid gap-3 md:grid-cols-2">
                {orderMeals
                  .filter((m) => m.status === "active" && m.availableDays.length)
                  .map((m) => (
                    <StandingOrderForm
                      key={m.id}
                      mealId={m.id}
                      mealTitle={m.title}
                      days={m.availableDays}
                      fulfillment={m.fulfillment}
                      defaultQty={order.items.find((it) => it.mealId === m.id)?.qty ?? 1}
                      defaultFulfillment={order.fulfillment}
                      defaultAddress={order.address || user.address}
                      signedIn
                      loginHref="/login"
                    />
                  ))}
              </div>
            </div>
          )}

          {done && (
            <div>
              <h2 className="text-xl font-bold">How was it?</h2>
              <p className="mb-3 text-sm text-ink-soft">Your rating helps neighbors choose and helps {order.cook.displayName} get better.</p>
              <div className="grid gap-4 md:grid-cols-2">
                {order.items.map((it, idx) => {
                  const mine = myReviews[idx];
                  return (
                    <div key={it.id}>
                      <p className="mb-1 text-sm font-bold">{it.title}</p>
                      <ReviewForm mealId={it.mealId} orderId={order.id} existing={mine ? { rating: mine.rating, comment: mine.comment } : null} />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="card p-5">
            <h2 className="text-lg font-bold">From the kitchen of</h2>
            <Link href={`/cooks/${order.cook.slug}`} className="mt-3 flex items-center gap-3 hover:text-tomato">
              <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-cream-deep">
                <Photo imageKey={order.cook.imageKey} alt={order.cook.displayName} fallbackLabel="cook" sizes="48px" />
              </span>
              <span>
                <span className="block font-bold">{order.cook.displayName}</span>
                <span className="block text-xs text-ink-muted">{order.cook.neighborhood}</span>
              </span>
            </Link>
            {order.fulfillment !== "pickup" && order.address && (
              <p className="mt-3 text-sm text-ink-soft">
                <span className="font-bold text-ink">{order.fulfillment === "delivery" ? "Delivering to" : "Dropping at"}:</span> {order.address}
              </p>
            )}
            {order.fulfillment === "pickup" && (
              <p className="mt-3 text-sm text-ink-soft">
                <span className="font-bold text-ink">Pickup:</span> {order.status === "placed" ? "Porch address appears once the cook accepts." : `Porch of ${order.cook.displayName}, ${order.cook.neighborhood}. Look for the cooler.`}
              </p>
            )}
            {order.note && (
              <p className="mt-3 rounded-xl bg-cream-deep p-3 text-sm italic text-ink-soft">“{order.note}”</p>
            )}
          </div>
          <div className="card p-5">
            <h2 className="text-lg font-bold">Receipt</h2>
            <dl className="mt-3 space-y-1.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-muted">Food</dt>
                <dd>{money(order.subtotalCents)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-muted">Neighborhood fee</dt>
                <dd>{money(order.feeCents)}</dd>
              </div>
              {order.deliveryCents > 0 && (
                <div className="flex justify-between">
                  <dt className="text-ink-muted">Delivery</dt>
                  <dd>{money(order.deliveryCents)}</dd>
                </div>
              )}
              {order.tipCents > 0 && (
                <div className="flex justify-between">
                  <dt className="text-ink-muted">Tip</dt>
                  <dd>{money(order.tipCents)}</dd>
                </div>
              )}
              <div className="flex justify-between border-t border-line pt-2">
                <dt className="font-bold">Total</dt>
                <dd className="font-display text-lg font-bold">{money(order.totalCents)}</dd>
              </div>
            </dl>
            <p className="mt-2 text-xs text-ink-muted">Payment ref {order.paymentRef}</p>
          </div>
          {!["cancelled", "placed", "pending_payment"].includes(order.status) && <ReportIssue orderId={order.id} existing={issue ? { kind: issue.kind, status: issue.status } : null} />}
        </aside>
      </div>
    </Section>
  );
}
