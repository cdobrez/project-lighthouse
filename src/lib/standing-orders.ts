import "server-only";
import { and, eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { newId } from "@/lib/ids";
import { DAY_ORDER } from "@/lib/format";
import { SERVICE_FEE_RATE, DELIVERY_FEE_CENTS } from "@/lib/pricing";
import { isStripeConfigured } from "@/lib/stripe";
import { notifyOrderPlaced, notifyPaymentNeeded } from "@/lib/notifications";

/**
 * Turns today's active standing orders into real orders. Runs once a day from
 * Vercel Cron (see vercel.json) or `GET /api/cron/standing-orders` with the CRON_SECRET.
 */
export async function runStandingOrders(now = new Date()): Promise<{ created: string[]; skipped: { id: string; reason: string }[] }> {
  const db = await getDb();
  const today = now.toISOString().slice(0, 10);
  const day = DAY_ORDER[(now.getUTCDay() + 6) % 7];
  const subs = await db.select().from(schema.subscriptions).where(and(eq(schema.subscriptions.status, "active"), eq(schema.subscriptions.day, day))).all();
  const created: string[] = [];
  const skipped: { id: string; reason: string }[] = [];
  const payLater = isStripeConfigured();

  for (const sub of subs) {
    if (sub.lastOrderedOn === today) {
      skipped.push({ id: sub.id, reason: "already ordered today" });
      continue;
    }
    const meal = await db.select().from(schema.meals).where(eq(schema.meals.id, sub.mealId)).get();
    if (!meal || meal.status !== "active") {
      skipped.push({ id: sub.id, reason: "meal unavailable" });
      continue;
    }
    if (meal.portionsAvailable < sub.qty) {
      skipped.push({ id: sub.id, reason: "sold out" });
      continue;
    }
    const subtotal = meal.priceCents * sub.qty;
    const fee = Math.round(subtotal * SERVICE_FEE_RATE);
    const delivery = sub.fulfillment === "delivery" ? DELIVERY_FEE_CENTS : 0;
    const tip = Math.round((subtotal * sub.tipPercent) / 100);
    const orderId = newId("ord");
    await db.transaction(async (tx) => {
      await tx
        .insert(schema.orders)
        .values({
          id: orderId,
          userId: sub.userId,
          cookId: sub.cookId,
          status: payLater ? "pending_payment" : "placed",
          fulfillment: sub.fulfillment,
          address: sub.address,
          scheduledFor: `Today (${day}) · ${meal.readyWindow}`,
          note: sub.note ? `${sub.note} (weekly standing order)` : "Weekly standing order",
          subtotalCents: subtotal,
          feeCents: fee,
          deliveryCents: delivery,
          tipCents: tip,
          totalCents: subtotal + fee + delivery + tip,
          paymentRef: payLater ? "" : `demo_${newId()}`,
        })
        .run();
      await tx.insert(schema.orderItems).values({ id: newId("oi"), orderId, mealId: meal.id, title: meal.title, qty: sub.qty, unitCents: meal.priceCents }).run();
      await tx
        .update(schema.meals)
        .set({ portionsAvailable: meal.portionsAvailable - sub.qty, timesOrdered: meal.timesOrdered + sub.qty })
        .where(eq(schema.meals.id, meal.id))
        .run();
      await tx.update(schema.subscriptions).set({ lastOrderedOn: today }).where(eq(schema.subscriptions.id, sub.id)).run();
    });
    created.push(orderId);
    if (payLater) void notifyPaymentNeeded(orderId);
    else void notifyOrderPlaced(orderId);
  }
  return { created, skipped };
}
