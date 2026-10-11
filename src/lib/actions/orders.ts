"use server";

import { redirect } from "next/navigation";
import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { getDb, schema } from "@/lib/db";
import { getCurrentUser, getCurrentCook } from "@/lib/auth";
import { newId } from "@/lib/ids";
import { revalidatePath } from "next/cache";
import { ORDER_FLOW } from "@/lib/order-status";
import { isStripeConfigured, createCheckoutSession, checkoutSessionPaid } from "@/lib/stripe";
import { notifyOrderPlaced, notifyOrderStatus } from "@/lib/notifications";
import { photoSrc } from "@/lib/images";

import { SERVICE_FEE_RATE, DELIVERY_FEE_CENTS } from "@/lib/pricing";

export type PlaceOrderInput = {
  items: { mealId: string; qty: number }[];
  fulfillment: "pickup" | "dropoff" | "delivery";
  address: string;
  scheduledFor: string;
  note: string;
  tipCents: number;
};

export type PlaceOrderResult = { ok: true; orderId: string; checkoutUrl?: string } | { ok: false; error: string };

const inputSchema = z.object({
  items: z.array(z.object({ mealId: z.string().min(1), qty: z.number().int().min(1).max(20) })).min(1),
  fulfillment: z.enum(["pickup", "dropoff", "delivery"]),
  address: z.string().trim().max(200),
  scheduledFor: z.string().trim().min(1).max(80),
  note: z.string().trim().max(500),
  tipCents: z.number().int().min(0).max(10000),
});

export async function placeOrder(raw: PlaceOrderInput): Promise<PlaceOrderResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Please sign in to place an order." };
  const parsed = inputSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Something in the order didn't look right. Check your basket and try again." };
  const input = parsed.data;
  const db = await getDb();

  const mealRows = await db
    .select()
    .from(schema.meals)
    .where(inArray(schema.meals.id, input.items.map((i) => i.mealId)))
    .all();
  if (mealRows.length !== input.items.length) return { ok: false, error: "One of the meals in your basket is no longer available." };
  const cookId = mealRows[0].cookId;
  if (mealRows.some((m) => m.cookId !== cookId)) return { ok: false, error: "Orders can only include meals from a single cook." };
  if (mealRows.some((m) => m.status !== "active")) return { ok: false, error: "One of those meals is paused right now." };
  if (mealRows.some((m) => !m.fulfillment.includes(input.fulfillment))) {
    return { ok: false, error: "That cook doesn't offer the fulfillment option you picked." };
  }
  if (input.fulfillment !== "pickup" && input.address.length < 5) {
    return { ok: false, error: "Add a drop-off address so the cook knows where to go." };
  }
  for (const item of input.items) {
    const meal = mealRows.find((m) => m.id === item.mealId)!;
    if (meal.portionsAvailable < item.qty) {
      return { ok: false, error: `Only ${meal.portionsAvailable} portions of ${meal.title} are left tonight.` };
    }
  }

  const subtotal = input.items.reduce((sum, it) => sum + it.qty * mealRows.find((m) => m.id === it.mealId)!.priceCents, 0);
  const fee = Math.round(subtotal * SERVICE_FEE_RATE);
  const delivery = input.fulfillment === "delivery" ? DELIVERY_FEE_CENTS : 0;
  const total = subtotal + fee + delivery + input.tipCents;
  const orderId = newId("ord");
  const payLater = isStripeConfigured();

  await db.transaction(async (tx) => {
    await tx.insert(schema.orders)
      .values({
        id: orderId,
        userId: user.id,
        cookId,
        status: payLater ? "pending_payment" : "placed",
        fulfillment: input.fulfillment,
        address: input.fulfillment === "pickup" ? "" : input.address,
        scheduledFor: input.scheduledFor,
        note: input.note,
        subtotalCents: subtotal,
        feeCents: fee,
        deliveryCents: delivery,
        tipCents: input.tipCents,
        totalCents: total,
        paymentRef: payLater ? "" : `demo_${newId()}`,
      })
      .run();
    for (const item of input.items) {
      const meal = mealRows.find((m) => m.id === item.mealId)!;
      await tx.insert(schema.orderItems)
        .values({ id: newId("oi"), orderId, mealId: meal.id, title: meal.title, qty: item.qty, unitCents: meal.priceCents })
        .run();
      await tx.update(schema.meals)
        .set({ portionsAvailable: meal.portionsAvailable - item.qty, timesOrdered: meal.timesOrdered + item.qty })
        .where(eq(schema.meals.id, meal.id))
        .run();
    }
  });

  revalidatePath("/meals");
  revalidatePath("/orders");
  revalidatePath("/cook");

  if (payLater) {
    const cook = await db.select().from(schema.cooks).where(eq(schema.cooks.id, cookId)).get();
    const base = process.env.SITE_URL ?? "https://gigkitchens.com";
    try {
      const checkoutUrl = await createCheckoutSession({
        orderId,
        customerEmail: user.email,
        cookName: cook?.displayName ?? "your cook",
        feeCents: fee,
        deliveryCents: delivery,
        tipCents: input.tipCents,
        lines: input.items.map((it) => {
          const meal = mealRows.find((m) => m.id === it.mealId)!;
          const src = photoSrc(meal.imageKey);
          return { title: meal.title, qty: it.qty, unitCents: meal.priceCents, imageUrl: src ? (src.startsWith("/") ? `${base}${src}` : src) : undefined };
        }),
      });
      return { ok: true, orderId, checkoutUrl };
    } catch (err) {
      console.error("[gigkitchens] stripe checkout failed", err);
      await releaseOrder(orderId);
      return { ok: false, error: "We couldn't start the payment. Nothing was charged. Please try again." };
    }
  }

  void notifyOrderPlaced(orderId);
  return { ok: true, orderId };
}

/** Cancels an order and returns its portions to the cook's menu. */
async function releaseOrder(orderId: string) {
  const db = await getDb();
  await db.transaction(async (tx) => {
    const order = await tx.select().from(schema.orders).where(eq(schema.orders.id, orderId)).get();
    if (!order || order.status === "cancelled") return;
    await tx.update(schema.orders).set({ status: "cancelled", updatedAt: new Date().toISOString() }).where(eq(schema.orders.id, orderId)).run();
    const items = await tx.select().from(schema.orderItems).where(eq(schema.orderItems.orderId, orderId)).all();
    for (const it of items) {
      const meal = await tx.select().from(schema.meals).where(eq(schema.meals.id, it.mealId)).get();
      if (meal) await tx.update(schema.meals).set({ portionsAvailable: meal.portionsAvailable + it.qty, timesOrdered: Math.max(0, meal.timesOrdered - it.qty) }).where(eq(schema.meals.id, meal.id)).run();
    }
  });
}

/** Marks a pending order as paid. Called from the Stripe webhook and from the success page as a fallback. */
export async function confirmPayment(orderId: string, paymentRef: string): Promise<boolean> {
  const db = await getDb();
  const order = await db.select().from(schema.orders).where(eq(schema.orders.id, orderId)).get();
  if (!order) return false;
  if (order.status !== "pending_payment") return true;
  await db.update(schema.orders).set({ status: "placed", paymentRef, updatedAt: new Date().toISOString() }).where(eq(schema.orders.id, orderId)).run();
  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/orders");
  revalidatePath("/cook");
  void notifyOrderPlaced(orderId);
  return true;
}

/** Success-page fallback: verifies the Checkout session with Stripe when the webhook hasn't arrived yet. */
export async function verifyCheckoutSession(orderId: string, sessionId: string): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user || !isStripeConfigured()) return false;
  const db = await getDb();
  const order = await db.select().from(schema.orders).where(and(eq(schema.orders.id, orderId), eq(schema.orders.userId, user.id))).get();
  if (!order) return false;
  if (order.status !== "pending_payment") return true;
  try {
    const { paid, paymentRef } = await checkoutSessionPaid(sessionId, orderId);
    if (!paid) return false;
    return confirmPayment(orderId, paymentRef);
  } catch (err) {
    console.error("[gigkitchens] could not verify checkout session", err);
    return false;
  }
}

/** Starts a fresh Checkout session for an order that is still awaiting payment. */
export async function resumePayment(orderId: string): Promise<{ ok: true; checkoutUrl: string } | { ok: false; error: string }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Sign in first." };
  if (!isStripeConfigured()) return { ok: false, error: "Payments aren't enabled." };
  const db = await getDb();
  const order = await db.select().from(schema.orders).where(and(eq(schema.orders.id, orderId), eq(schema.orders.userId, user.id))).get();
  if (!order || order.status !== "pending_payment") return { ok: false, error: "This order isn't awaiting payment." };
  const [items, cook] = await Promise.all([
    db.select().from(schema.orderItems).where(eq(schema.orderItems.orderId, orderId)).all(),
    db.select().from(schema.cooks).where(eq(schema.cooks.id, order.cookId)).get(),
  ]);
  try {
    const checkoutUrl = await createCheckoutSession({
      orderId,
      customerEmail: user.email,
      cookName: cook?.displayName ?? "your cook",
      feeCents: order.feeCents,
      deliveryCents: order.deliveryCents,
      tipCents: order.tipCents,
      lines: items.map((i) => ({ title: i.title, qty: i.qty, unitCents: i.unitCents })),
    });
    return { ok: true, checkoutUrl };
  } catch (err) {
    console.error("[gigkitchens] stripe checkout failed", err);
    return { ok: false, error: "We couldn't start the payment. Please try again." };
  }
}

export async function advanceOrder(orderId: string, nextStatus: string): Promise<{ ok: boolean; error?: string }> {
  const cook = await getCurrentCook();
  if (!cook) return { ok: false, error: "Only the cook can update this order." };
  const db = await getDb();
  const order = await db.select().from(schema.orders).where(and(eq(schema.orders.id, orderId), eq(schema.orders.cookId, cook.id))).get();
  if (!order) return { ok: false, error: "Order not found." };
  if (order.status === "pending_payment") return { ok: false, error: "This order hasn't been paid for yet." };
  const flow = ORDER_FLOW[order.fulfillment] ?? ORDER_FLOW.pickup;
  const allowed = [...flow, "cancelled"];
  if (!allowed.includes(nextStatus)) return { ok: false, error: "Invalid status." };
  const final = flow[flow.length - 1];
  await db.update(schema.orders).set({ status: nextStatus, updatedAt: new Date().toISOString() }).where(eq(schema.orders.id, orderId)).run();
  if (nextStatus === final) {
    const items = await db.select().from(schema.orderItems).where(eq(schema.orderItems.orderId, orderId)).all();
    const served = items.reduce((a, i) => a + i.qty, 0);
    await db.update(schema.cooks).set({ mealsServed: cook.mealsServed + served }).where(eq(schema.cooks.id, cook.id)).run();
  }
  revalidatePath("/cook");
  revalidatePath("/orders");
  revalidatePath(`/orders/${orderId}`);
  void notifyOrderStatus(orderId, nextStatus);
  return { ok: true };
}

export async function cancelMyOrder(orderId: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const db = await getDb();
  const order = await db.select().from(schema.orders).where(and(eq(schema.orders.id, orderId), eq(schema.orders.userId, user.id))).get();
  if (!order || !["pending_payment", "placed", "accepted"].includes(order.status)) return { ok: false, error: "This order can't be cancelled anymore." };
  await db.transaction(async (tx) => {
    await tx.update(schema.orders).set({ status: "cancelled", updatedAt: new Date().toISOString() }).where(eq(schema.orders.id, orderId)).run();
    const items = await tx.select().from(schema.orderItems).where(eq(schema.orderItems.orderId, orderId)).all();
    for (const it of items) {
      const meal = await tx.select().from(schema.meals).where(eq(schema.meals.id, it.mealId)).get();
      if (meal) tx.update(schema.meals).set({ portionsAvailable: meal.portionsAvailable + it.qty }).where(eq(schema.meals.id, meal.id)).run();
    }
  });
  revalidatePath("/orders");
  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/cook");
  return { ok: true };
}
