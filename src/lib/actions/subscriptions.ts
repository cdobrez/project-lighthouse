"use server";

import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getDb, schema } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { newId } from "@/lib/ids";
import { DAY_ORDER } from "@/lib/format";
import type { FormState } from "./auth";

const createSchema = z.object({
  mealId: z.string().min(1),
  qty: z.coerce.number().int().min(1).max(10),
  day: z.string().refine((d) => DAY_ORDER.includes(d), "Pick a day"),
  fulfillment: z.enum(["pickup", "dropoff", "delivery"]),
  address: z.string().trim().max(200).default(""),
  tipPercent: z.coerce.number().int().min(0).max(30).default(0),
  note: z.string().trim().max(300).default(""),
});

/** Sets up a weekly standing order: the same meal, same day, every week, until paused. */
export async function createStandingOrder(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Sign in to set up a weekly order." };
  const parsed = createSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data;
  const db = await getDb();
  const meal = await db.select().from(schema.meals).where(eq(schema.meals.id, d.mealId)).get();
  if (!meal || meal.status !== "active") return { error: "That meal isn't available right now." };
  if (!meal.availableDays.includes(d.day)) return { error: `${meal.title} isn't cooked on ${d.day}s.` };
  if (!meal.fulfillment.includes(d.fulfillment)) return { error: "That hand-off option isn't offered for this meal." };
  if (d.fulfillment !== "pickup" && d.address.length < 5) return { error: "Add an address for drop-off or delivery." };
  const existing = await db
    .select({ id: schema.subscriptions.id })
    .from(schema.subscriptions)
    .where(and(eq(schema.subscriptions.userId, user.id), eq(schema.subscriptions.mealId, meal.id), eq(schema.subscriptions.day, d.day), eq(schema.subscriptions.status, "active")))
    .get();
  if (existing) return { error: `You already get ${meal.title} every ${d.day}.` };
  await db
    .insert(schema.subscriptions)
    .values({
      id: newId("sub"),
      userId: user.id,
      cookId: meal.cookId,
      mealId: meal.id,
      qty: d.qty,
      day: d.day,
      fulfillment: d.fulfillment,
      address: d.fulfillment === "pickup" ? "" : d.address,
      tipPercent: d.tipPercent,
      note: d.note,
    })
    .run();
  revalidatePath("/account");
  revalidatePath("/cook");
  return { ok: true };
}

export async function setStandingOrderStatus(id: string, status: "active" | "paused" | "cancelled") {
  const user = await getCurrentUser();
  if (!user) return { ok: false };
  const db = await getDb();
  const sub = await db.select().from(schema.subscriptions).where(and(eq(schema.subscriptions.id, id), eq(schema.subscriptions.userId, user.id))).get();
  if (!sub) return { ok: false };
  await db.update(schema.subscriptions).set({ status }).where(eq(schema.subscriptions.id, id)).run();
  revalidatePath("/account");
  revalidatePath("/cook");
  return { ok: true };
}
