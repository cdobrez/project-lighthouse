import "server-only";
import { and, desc, eq, inArray, like, or, sql } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import type { Cook, Meal, Review, User } from "@/lib/db/schema";

export type MealWithCook = Meal & { cook: Cook };

export type MealFilters = {
  q?: string;
  cuisine?: string;
  diet?: string;
  fulfillment?: string;
  neighborhood?: string;
  day?: string;
  sort?: "popular" | "rating" | "price-asc" | "price-desc" | "newest";
};

export function listMeals(filters: MealFilters = {}): MealWithCook[] {
  const db = getDb();
  const conds = [eq(schema.meals.status, "active"), eq(schema.cooks.active, true)];
  if (filters.q) {
    const term = `%${filters.q.toLowerCase()}%`;
    conds.push(
      or(
        like(sql`lower(${schema.meals.title})`, term),
        like(sql`lower(${schema.meals.description})`, term),
        like(sql`lower(${schema.meals.cuisine})`, term),
        like(sql`lower(${schema.cooks.displayName})`, term)
      )!
    );
  }
  if (filters.cuisine) conds.push(eq(schema.meals.cuisine, filters.cuisine));
  if (filters.neighborhood) conds.push(eq(schema.cooks.neighborhood, filters.neighborhood));
  if (filters.diet) conds.push(like(schema.meals.dietaryTags, `%"${filters.diet}"%`));
  if (filters.fulfillment) conds.push(like(schema.meals.fulfillment, `%"${filters.fulfillment}"%`));
  if (filters.day) conds.push(like(schema.meals.availableDays, `%"${filters.day}"%`));

  const orderBy =
    filters.sort === "rating"
      ? [desc(schema.meals.ratingAvg), desc(schema.meals.ratingCount)]
      : filters.sort === "price-asc"
        ? [schema.meals.priceCents]
        : filters.sort === "price-desc"
          ? [desc(schema.meals.priceCents)]
          : filters.sort === "newest"
            ? [desc(schema.meals.createdAt)]
            : [desc(schema.meals.timesOrdered)];

  const rows = db
    .select({ meal: schema.meals, cook: schema.cooks })
    .from(schema.meals)
    .innerJoin(schema.cooks, eq(schema.meals.cookId, schema.cooks.id))
    .where(and(...conds))
    .orderBy(...orderBy)
    .all();
  return rows.map((r) => ({ ...r.meal, cook: r.cook }));
}

export function getMealBySlug(slug: string): MealWithCook | null {
  const db = getDb();
  const row = db
    .select({ meal: schema.meals, cook: schema.cooks })
    .from(schema.meals)
    .innerJoin(schema.cooks, eq(schema.meals.cookId, schema.cooks.id))
    .where(eq(schema.meals.slug, slug))
    .get();
  return row ? { ...row.meal, cook: row.cook } : null;
}

export function getMealsByIds(ids: string[]): Meal[] {
  if (!ids.length) return [];
  return getDb().select().from(schema.meals).where(inArray(schema.meals.id, ids)).all();
}

export function listCuisines(): string[] {
  const rows = getDb()
    .selectDistinct({ c: schema.meals.cuisine })
    .from(schema.meals)
    .where(eq(schema.meals.status, "active"))
    .orderBy(schema.meals.cuisine)
    .all();
  return rows.map((r) => r.c);
}

export function listCooks(neighborhood?: string): (Cook & { mealCount: number })[] {
  const db = getDb();
  const conds = [eq(schema.cooks.active, true)];
  if (neighborhood) conds.push(eq(schema.cooks.neighborhood, neighborhood));
  const rows = db
    .select({
      cook: schema.cooks,
      mealCount: sql<number>`(select count(*) from meals m where m.cook_id = ${schema.cooks.id} and m.status = 'active')`,
    })
    .from(schema.cooks)
    .where(and(...conds))
    .orderBy(desc(schema.cooks.ratingAvg), desc(schema.cooks.ratingCount))
    .all();
  return rows.map((r) => ({ ...r.cook, mealCount: r.mealCount }));
}

export function getCookBySlug(slug: string): (Cook & { user: User; meals: Meal[] }) | null {
  const db = getDb();
  const cook = db.select().from(schema.cooks).where(eq(schema.cooks.slug, slug)).get();
  if (!cook) return null;
  const user = db.select().from(schema.users).where(eq(schema.users.id, cook.userId)).get()!;
  const meals = db.select().from(schema.meals).where(eq(schema.meals.cookId, cook.id)).orderBy(desc(schema.meals.timesOrdered)).all();
  return { ...cook, user, meals };
}

export type ReviewWithUser = Review & { user: Pick<User, "name" | "avatarHue" | "neighborhood">; mealTitle?: string | null };

export function listReviewsForMeal(mealId: string): ReviewWithUser[] {
  return getDb()
    .select({ review: schema.reviews, name: schema.users.name, avatarHue: schema.users.avatarHue, neighborhood: schema.users.neighborhood })
    .from(schema.reviews)
    .innerJoin(schema.users, eq(schema.reviews.userId, schema.users.id))
    .where(eq(schema.reviews.mealId, mealId))
    .orderBy(desc(schema.reviews.createdAt))
    .all()
    .map((r) => ({ ...r.review, user: { name: r.name, avatarHue: r.avatarHue, neighborhood: r.neighborhood } }));
}

export function listReviewsForCook(cookId: string, limit = 20): ReviewWithUser[] {
  return getDb()
    .select({
      review: schema.reviews,
      name: schema.users.name,
      avatarHue: schema.users.avatarHue,
      neighborhood: schema.users.neighborhood,
      mealTitle: schema.meals.title,
    })
    .from(schema.reviews)
    .innerJoin(schema.users, eq(schema.reviews.userId, schema.users.id))
    .leftJoin(schema.meals, eq(schema.reviews.mealId, schema.meals.id))
    .where(eq(schema.reviews.cookId, cookId))
    .orderBy(desc(schema.reviews.createdAt))
    .limit(limit)
    .all()
    .map((r) => ({ ...r.review, mealTitle: r.mealTitle, user: { name: r.name, avatarHue: r.avatarHue, neighborhood: r.neighborhood } }));
}

export function recentReviews(limit = 6): (ReviewWithUser & { mealSlug: string | null; cookName: string })[] {
  return getDb()
    .select({
      review: schema.reviews,
      name: schema.users.name,
      avatarHue: schema.users.avatarHue,
      neighborhood: schema.users.neighborhood,
      mealTitle: schema.meals.title,
      mealSlug: schema.meals.slug,
      cookName: schema.cooks.displayName,
    })
    .from(schema.reviews)
    .innerJoin(schema.users, eq(schema.reviews.userId, schema.users.id))
    .innerJoin(schema.cooks, eq(schema.reviews.cookId, schema.cooks.id))
    .leftJoin(schema.meals, eq(schema.reviews.mealId, schema.meals.id))
    .where(sql`length(${schema.reviews.comment}) > 0`)
    .orderBy(desc(schema.reviews.createdAt))
    .limit(limit)
    .all()
    .map((r) => ({
      ...r.review,
      mealTitle: r.mealTitle,
      mealSlug: r.mealSlug,
      cookName: r.cookName,
      user: { name: r.name, avatarHue: r.avatarHue, neighborhood: r.neighborhood },
    }));
}

export type OrderFull = typeof schema.orders.$inferSelect & {
  items: (typeof schema.orderItems.$inferSelect & { mealSlug: string; imageKey: string; cuisine: string })[];
  cook: Cook;
  customer: Pick<User, "name" | "avatarHue" | "neighborhood" | "phone">;
};

function hydrateOrders(orderRows: (typeof schema.orders.$inferSelect)[]): OrderFull[] {
  if (!orderRows.length) return [];
  const db = getDb();
  const ids = orderRows.map((o) => o.id);
  const items = db
    .select({ item: schema.orderItems, mealSlug: schema.meals.slug, imageKey: schema.meals.imageKey, cuisine: schema.meals.cuisine })
    .from(schema.orderItems)
    .innerJoin(schema.meals, eq(schema.orderItems.mealId, schema.meals.id))
    .where(inArray(schema.orderItems.orderId, ids))
    .all();
  const cookIds = [...new Set(orderRows.map((o) => o.cookId))];
  const cooks = db.select().from(schema.cooks).where(inArray(schema.cooks.id, cookIds)).all();
  const userIds = [...new Set(orderRows.map((o) => o.userId))];
  const users = db.select().from(schema.users).where(inArray(schema.users.id, userIds)).all();
  return orderRows.map((o) => ({
    ...o,
    items: items.filter((i) => i.item.orderId === o.id).map((i) => ({ ...i.item, mealSlug: i.mealSlug, imageKey: i.imageKey, cuisine: i.cuisine })),
    cook: cooks.find((c) => c.id === o.cookId)!,
    customer: (() => {
      const u = users.find((u) => u.id === o.userId)!;
      return { name: u.name, avatarHue: u.avatarHue, neighborhood: u.neighborhood, phone: u.phone };
    })(),
  }));
}

export function listOrdersForUser(userId: string): OrderFull[] {
  const rows = getDb().select().from(schema.orders).where(eq(schema.orders.userId, userId)).orderBy(desc(schema.orders.createdAt)).all();
  return hydrateOrders(rows);
}

export function listOrdersForCook(cookId: string): OrderFull[] {
  const rows = getDb().select().from(schema.orders).where(eq(schema.orders.cookId, cookId)).orderBy(desc(schema.orders.createdAt)).all();
  return hydrateOrders(rows);
}

export function getOrder(orderId: string): OrderFull | null {
  const row = getDb().select().from(schema.orders).where(eq(schema.orders.id, orderId)).get();
  return row ? hydrateOrders([row])[0] : null;
}

export function userHasReviewed(userId: string, mealId: string): Review | null {
  return getDb().select().from(schema.reviews).where(and(eq(schema.reviews.userId, userId), eq(schema.reviews.mealId, mealId))).get() ?? null;
}

export function userFavorites(userId: string): Set<string> {
  return new Set(getDb().select({ m: schema.favorites.mealId }).from(schema.favorites).where(eq(schema.favorites.userId, userId)).all().map((r) => r.m));
}

export function listFavoriteMeals(userId: string): MealWithCook[] {
  const ids = [...userFavorites(userId)];
  if (!ids.length) return [];
  return getDb()
    .select({ meal: schema.meals, cook: schema.cooks })
    .from(schema.meals)
    .innerJoin(schema.cooks, eq(schema.meals.cookId, schema.cooks.id))
    .where(inArray(schema.meals.id, ids))
    .all()
    .map((r) => ({ ...r.meal, cook: r.cook }));
}

export type PostWithAuthor = typeof schema.posts.$inferSelect & {
  author: Pick<User, "name" | "avatarHue" | "neighborhood">;
  replyCount: number;
};

export function listPosts(neighborhood?: string, kind?: string): PostWithAuthor[] {
  const conds = [];
  if (neighborhood) conds.push(eq(schema.posts.neighborhood, neighborhood));
  if (kind) conds.push(eq(schema.posts.kind, kind));
  return getDb()
    .select({
      post: schema.posts,
      name: schema.users.name,
      avatarHue: schema.users.avatarHue,
      userNeighborhood: schema.users.neighborhood,
      replyCount: sql<number>`(select count(*) from replies r where r.post_id = ${schema.posts.id})`,
    })
    .from(schema.posts)
    .innerJoin(schema.users, eq(schema.posts.userId, schema.users.id))
    .where(conds.length ? and(...conds) : undefined)
    .orderBy(desc(schema.posts.createdAt))
    .all()
    .map((r) => ({ ...r.post, replyCount: r.replyCount, author: { name: r.name, avatarHue: r.avatarHue, neighborhood: r.userNeighborhood } }));
}

export function getPost(id: string): (PostWithAuthor & { replies: (typeof schema.replies.$inferSelect & { author: Pick<User, "name" | "avatarHue"> })[] }) | null {
  const db = getDb();
  const post = listPosts().find((p) => p.id === id);
  if (!post) return null;
  const replies = db
    .select({ reply: schema.replies, name: schema.users.name, avatarHue: schema.users.avatarHue })
    .from(schema.replies)
    .innerJoin(schema.users, eq(schema.replies.userId, schema.users.id))
    .where(eq(schema.replies.postId, id))
    .orderBy(schema.replies.createdAt)
    .all()
    .map((r) => ({ ...r.reply, author: { name: r.name, avatarHue: r.avatarHue } }));
  return { ...post, replies };
}

export function siteStats() {
  const db = getDb();
  const cooks = db.select({ n: sql<number>`count(*)` }).from(schema.cooks).where(eq(schema.cooks.active, true)).get()?.n ?? 0;
  const meals = db.select({ n: sql<number>`count(*)` }).from(schema.meals).where(eq(schema.meals.status, "active")).get()?.n ?? 0;
  const served = db.select({ n: sql<number>`coalesce(sum(meals_served),0)` }).from(schema.cooks).get()?.n ?? 0;
  const reviews = db.select({ n: sql<number>`count(*)` }).from(schema.reviews).get()?.n ?? 0;
  return { cooks, meals, served, reviews };
}
