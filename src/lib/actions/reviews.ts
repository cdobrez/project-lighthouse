"use server";

import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getDb, schema, type Tx } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { newId } from "@/lib/ids";
import type { FormState } from "./auth";

const schemaReview = z.object({
  mealId: z.string().min(1),
  orderId: z.string().optional(),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().max(600).default(""),
});

export async function addReview(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Sign in to leave a rating." };
  const parsed = schemaReview.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Pick a star rating first." };
  const { mealId, orderId, rating, comment } = parsed.data;
  const db = await getDb();
  const meal = await db.select().from(schema.meals).where(eq(schema.meals.id, mealId)).get();
  if (!meal) return { error: "Meal not found." };

  const existing = await db
    .select({ id: schema.reviews.id, rating: schema.reviews.rating })
    .from(schema.reviews)
    .where(and(eq(schema.reviews.mealId, mealId), eq(schema.reviews.userId, user.id)))
    .get();

  await db.transaction(async (tx) => {
    if (existing) {
      await tx.update(schema.reviews).set({ rating, comment, createdAt: new Date().toISOString() }).where(eq(schema.reviews.id, existing.id)).run();
    } else {
      await tx.insert(schema.reviews)
        .values({ id: newId("rev"), userId: user.id, cookId: meal.cookId, mealId, orderId: orderId || null, rating, comment })
        .run();
    }
    await recomputeRatings(tx, mealId, meal.cookId);
  });

  revalidatePath(`/meals/${meal.slug}`);
  revalidatePath("/meals");
  revalidatePath("/cooks");
  return { ok: true };
}

async function recomputeRatings(tx: Tx, mealId: string, cookId: string) {
  const mealRows = await tx.select({ r: schema.reviews.rating }).from(schema.reviews).where(eq(schema.reviews.mealId, mealId)).all();
  const mealAvg = mealRows.length ? mealRows.reduce((a, b) => a + b.r, 0) / mealRows.length : 0;
  await tx.update(schema.meals).set({ ratingAvg: Math.round(mealAvg * 10) / 10, ratingCount: mealRows.length }).where(eq(schema.meals.id, mealId)).run();
  const cookRows = await tx.select({ r: schema.reviews.rating }).from(schema.reviews).where(eq(schema.reviews.cookId, cookId)).all();
  const cookAvg = cookRows.length ? cookRows.reduce((a, b) => a + b.r, 0) / cookRows.length : 0;
  await tx.update(schema.cooks).set({ ratingAvg: Math.round(cookAvg * 10) / 10, ratingCount: cookRows.length }).where(eq(schema.cooks.id, cookId)).run();
}

export async function toggleFavorite(mealId: string): Promise<{ favorited: boolean } | { error: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: "Sign in to save meals." };
  const db = await getDb();
  const existing = await db
    .select()
    .from(schema.favorites)
    .where(and(eq(schema.favorites.userId, user.id), eq(schema.favorites.mealId, mealId)))
    .get();
  if (existing) {
    await db.delete(schema.favorites).where(and(eq(schema.favorites.userId, user.id), eq(schema.favorites.mealId, mealId))).run();
    revalidatePath("/account");
    return { favorited: false };
  }
  await db.insert(schema.favorites).values({ userId: user.id, mealId }).run();
  revalidatePath("/account");
  return { favorited: true };
}
