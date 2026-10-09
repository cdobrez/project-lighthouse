"use server";

import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getDb, schema } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { newId } from "@/lib/ids";
import type { FormState } from "./auth";

const issueSchema = z.object({
  orderId: z.string().min(1),
  kind: z.enum(["late", "cold", "missing", "not_as_described", "other"]),
  details: z.string().trim().max(1000).default(""),
});

export async function reportIssue(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Sign in to report a problem." };
  const parsed = issueSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Pick what went wrong." };
  const { orderId, kind, details } = parsed.data;
  const db = getDb();
  const order = db.select().from(schema.orders).where(and(eq(schema.orders.id, orderId), eq(schema.orders.userId, user.id))).get();
  if (!order) return { error: "Order not found." };
  const existing = db.select({ id: schema.issues.id }).from(schema.issues).where(eq(schema.issues.orderId, orderId)).get();
  if (existing) return { error: "You've already reported this order. We're on it." };
  db.insert(schema.issues).values({ id: newId("iss"), orderId, userId: user.id, cookId: order.cookId, kind, details }).run();
  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/cook");
  return { ok: true };
}
