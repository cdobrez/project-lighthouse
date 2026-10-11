"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb, schema } from "@/lib/db";
import { getCurrentUser, getCurrentCook } from "@/lib/auth";
import { newId } from "@/lib/ids";
import { sendEmail, emailLayout, siteUrl } from "@/lib/email";
import type { FormState } from "./auth";

/** Either party on an order (the neighbor who placed it or the cook filling it) can post to its thread. */
async function participant(orderId: string) {
  const user = await getCurrentUser();
  if (!user) return null;
  const db = await getDb();
  const order = await db.select().from(schema.orders).where(eq(schema.orders.id, orderId)).get();
  if (!order) return null;
  if (order.userId === user.id) return { user, order, role: "customer" as const };
  const cook = await getCurrentCook();
  if (cook && cook.id === order.cookId) return { user, order, role: "cook" as const };
  return null;
}

export async function sendOrderMessage(_prev: FormState, formData: FormData): Promise<FormState> {
  const orderId = String(formData.get("orderId") ?? "");
  const body = String(formData.get("body") ?? "").trim().slice(0, 1000);
  if (!orderId || body.length < 1) return { error: "Write a message first." };
  const ctx = await participant(orderId);
  if (!ctx) return { error: "You can't message on this order." };
  const db = await getDb();
  await db
    .insert(schema.messages)
    .values({ id: newId("msg"), orderId, senderId: ctx.user.id, body, readByCook: ctx.role === "cook", readByCustomer: ctx.role === "customer" })
    .run();
  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/cook");
  revalidatePath(`/cook/orders/${orderId}`);

  // Let the other side know by email (no-op until RESEND_API_KEY is set).
  const recipientId = ctx.role === "cook" ? ctx.order.userId : (await db.select().from(schema.cooks).where(eq(schema.cooks.id, ctx.order.cookId)).get())?.userId;
  if (recipientId) {
    const recipient = await db.select().from(schema.users).where(eq(schema.users.id, recipientId)).get();
    if (recipient) {
      const link = ctx.role === "cook" ? `${siteUrl()}/orders/${orderId}` : `${siteUrl()}/cook/orders/${orderId}`;
      void sendEmail({
        to: recipient.email,
        subject: `Message from ${ctx.user.name.split(" ")[0]} about your order`,
        html: emailLayout(`${ctx.user.name.split(" ")[0]} says:`, `<p>“${body.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c] ?? c)}”</p>`, { href: link, label: "Reply" }),
      });
    }
  }
  return { ok: true };
}

export async function markThreadRead(orderId: string) {
  const ctx = await participant(orderId);
  if (!ctx) return;
  const db = await getDb();
  await db
    .update(schema.messages)
    .set(ctx.role === "cook" ? { readByCook: true } : { readByCustomer: true })
    .where(and(eq(schema.messages.orderId, orderId)))
    .run();
}
