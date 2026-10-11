import "server-only";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { sendEmail, emailLayout, siteUrl } from "@/lib/email";
import { money, FULFILLMENT_LABELS } from "@/lib/format";
import { STATUS_LABELS } from "@/lib/order-status";
import { COOK_SHARE } from "@/lib/pricing";

async function orderContext(orderId: string) {
  const db = await getDb();
  const order = await db.select().from(schema.orders).where(eq(schema.orders.id, orderId)).get();
  if (!order) return null;
  const [customer, cook, items] = await Promise.all([
    db.select().from(schema.users).where(eq(schema.users.id, order.userId)).get(),
    db.select().from(schema.cooks).where(eq(schema.cooks.id, order.cookId)).get(),
    db.select().from(schema.orderItems).where(eq(schema.orderItems.orderId, orderId)).all(),
  ]);
  if (!customer || !cook) return null;
  const cookUser = await db.select().from(schema.users).where(eq(schema.users.id, cook.userId)).get();
  return { order, customer, cook, cookUser, items };
}

function itemList(items: { qty: number; title: string; unitCents: number }[]) {
  return `<ul style="padding-left:18px">${items.map((i) => `<li>${i.qty} × ${escape(i.title)} · ${money(i.qty * i.unitCents)}</li>`).join("")}</ul>`;
}

function escape(s: string) {
  return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] ?? c);
}

/** Emails the cook and the neighbor once an order is confirmed (paid, or placed in demo mode). */
export async function notifyOrderPlaced(orderId: string) {
  const ctx = await orderContext(orderId);
  if (!ctx) return;
  const { order, customer, cook, cookUser, items } = ctx;
  const handoff = FULFILLMENT_LABELS[order.fulfillment]?.label ?? order.fulfillment;
  await Promise.all([
    sendEmail({
      to: customer.email,
      subject: `Order received: ${items.map((i) => i.title).join(", ")}`,
      html: emailLayout(
        `${cook.displayName} has your order`,
        `<p>${escape(handoff)} · ${escape(order.scheduledFor)}</p>${itemList(items)}<p>Total ${money(order.totalCents)}. You'll get an email as it moves from accepted to cooking to handed off.</p>`,
        { href: `${siteUrl()}/orders/${order.id}`, label: "Track your order" }
      ),
    }),
    cookUser
      ? sendEmail({
          to: cookUser.email,
          subject: `New order from ${customer.name.split(" ")[0]} · ${items.reduce((a, i) => a + i.qty, 0)} portions`,
          html: emailLayout(
            `New order for ${escape(order.scheduledFor)}`,
            `<p><strong>${escape(customer.name)}</strong> (${escape(customer.neighborhood)}) · ${escape(handoff)}</p>${itemList(items)}${order.note ? `<p><em>“${escape(order.note)}”</em></p>` : ""}<p>You earn <strong>${money(Math.round(order.subtotalCents * COOK_SHARE) + order.tipCents)}</strong> on this order.</p>`,
            { href: `${siteUrl()}/cook`, label: "Accept in your dashboard" }
          ),
        })
      : Promise.resolve(),
  ]);
}

/** Emails the neighbor when the cook moves the order along. */
export async function notifyOrderStatus(orderId: string, status: string) {
  const ctx = await orderContext(orderId);
  if (!ctx) return;
  const { order, customer, cook, items } = ctx;
  const label = STATUS_LABELS[status] ?? status;
  const line =
    status === "accepted"
      ? `${cook.displayName} accepted your order and will start cooking in time for ${order.scheduledFor}.`
      : status === "cooking"
        ? `It's on the stove. ${cook.displayName} is cooking your ${items.map((i) => i.title).join(", ")}.`
        : status === "ready"
          ? `Ready for pickup on ${cook.displayName}'s porch (${cook.neighborhood}). Look for the cooler.`
          : status === "out_for_delivery"
            ? `On its way to ${order.address || "you"}. Should be at the door shortly.`
            : status === "delivered" || status === "picked_up"
              ? `Enjoy! When you're done, rate the recipe so your neighbors know what's good.`
              : status === "cancelled"
                ? `${cook.displayName} couldn't take this order. You haven't been charged for it.`
                : label;
  await sendEmail({
    to: customer.email,
    subject: `${label}: ${items.map((i) => i.title).join(", ")}`,
    html: emailLayout(label, `<p>${escape(line)}</p>`, { href: `${siteUrl()}/orders/${order.id}`, label: "View order" }),
  });
}

export async function notifyWelcome(email: string, name: string) {
  await sendEmail({
    to: email,
    subject: "Welcome to the neighborhood",
    html: emailLayout(
      `Pull up a chair, ${escape(name.split(" ")[0])}`,
      `<p>You're in. Browse what's cooking a few doors down, pick how you want it handed off, and rate the recipe afterwards.</p><p>Cook yourself? Open a kitchen and keep 92% of every order.</p>`,
      { href: `${siteUrl()}/meals`, label: "See tonight's meals" }
    ),
  });
}

/** For standing orders when payments are on: the order is reserved and needs a quick payment. */
export async function notifyPaymentNeeded(orderId: string) {
  const ctx = await orderContext(orderId);
  if (!ctx) return;
  const { order, customer, cook, items } = ctx;
  await sendEmail({
    to: customer.email,
    subject: `Your weekly ${items.map((i) => i.title).join(", ")} is reserved`,
    html: emailLayout(
      `${cook.displayName} has your standing order`,
      `<p>${escape(order.scheduledFor)}. Tap below to pay ${money(order.totalCents)} and it goes on the stove.</p>${itemList(items)}`,
      { href: `${siteUrl()}/orders/${order.id}`, label: "Pay now" }
    ),
  });
}
