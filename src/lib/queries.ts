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

export async function listMeals(filters: MealFilters = {}): Promise<MealWithCook[]> {
  const db = await getDb();
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

  const rows = await db
    .select({ meal: schema.meals, cook: schema.cooks })
    .from(schema.meals)
    .innerJoin(schema.cooks, eq(schema.meals.cookId, schema.cooks.id))
    .where(and(...conds))
    .orderBy(...orderBy)
    .all();
  return rows.map((r) => ({ ...r.meal, cook: r.cook }));
}

export async function getMealBySlug(slug: string): Promise<MealWithCook | null> {
  const db = await getDb();
  const row = await db
    .select({ meal: schema.meals, cook: schema.cooks })
    .from(schema.meals)
    .innerJoin(schema.cooks, eq(schema.meals.cookId, schema.cooks.id))
    .where(eq(schema.meals.slug, slug))
    .get();
  return row ? { ...row.meal, cook: row.cook } : null;
}

export async function getMealsByIds(ids: string[]): Promise<Meal[]> {
  if (!ids.length) return [];
  const db = await getDb();
  return db.select().from(schema.meals).where(inArray(schema.meals.id, ids)).all();
}

export async function listCuisines(): Promise<string[]> {
  const db = await getDb();
  const rows = await db
    .selectDistinct({ c: schema.meals.cuisine })
    .from(schema.meals)
    .where(eq(schema.meals.status, "active"))
    .orderBy(schema.meals.cuisine)
    .all();
  return rows.map((r) => r.c);
}

export async function listCooks(neighborhood?: string): Promise<(Cook & { mealCount: number })[]> {
  const db = await getDb();
  const conds = [eq(schema.cooks.active, true)];
  if (neighborhood) conds.push(eq(schema.cooks.neighborhood, neighborhood));
  const countRows = await db
    .select({ cookId: schema.meals.cookId, n: sql<number>`count(*)` })
    .from(schema.meals)
    .where(eq(schema.meals.status, "active"))
    .groupBy(schema.meals.cookId)
    .all();
  const counts = new Map(countRows.map((r) => [r.cookId, Number(r.n)]));
  const cooks = await db
    .select()
    .from(schema.cooks)
    .where(and(...conds))
    .orderBy(desc(schema.cooks.ratingAvg), desc(schema.cooks.ratingCount))
    .all();
  return cooks.map((c) => ({ ...c, mealCount: counts.get(c.id) ?? 0 }));
}

export async function getCookBySlug(slug: string): Promise<(Cook & { user: User; meals: Meal[] }) | null> {
  const db = await getDb();
  const cook = await db.select().from(schema.cooks).where(eq(schema.cooks.slug, slug)).get();
  if (!cook) return null;
  const user = (await db.select().from(schema.users).where(eq(schema.users.id, cook.userId)).get())!;
  const meals = await db.select().from(schema.meals).where(eq(schema.meals.cookId, cook.id)).orderBy(desc(schema.meals.timesOrdered)).all();
  return { ...cook, user, meals };
}

export type ReviewWithUser = Review & { user: Pick<User, "name" | "avatarHue" | "neighborhood">; mealTitle?: string | null };

export async function listReviewsForMeal(mealId: string): Promise<ReviewWithUser[]> {
  const db = await getDb();
  const rows = await db
    .select({ review: schema.reviews, name: schema.users.name, avatarHue: schema.users.avatarHue, neighborhood: schema.users.neighborhood })
    .from(schema.reviews)
    .innerJoin(schema.users, eq(schema.reviews.userId, schema.users.id))
    .where(eq(schema.reviews.mealId, mealId))
    .orderBy(desc(schema.reviews.createdAt))
    .all();
  return rows.map((r) => ({ ...r.review, user: { name: r.name, avatarHue: r.avatarHue, neighborhood: r.neighborhood } }));
}

export async function listReviewsForCook(cookId: string, limit = 20): Promise<ReviewWithUser[]> {
  const db = await getDb();
  const rows = await db
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
    .all();
  return rows.map((r) => ({ ...r.review, mealTitle: r.mealTitle, user: { name: r.name, avatarHue: r.avatarHue, neighborhood: r.neighborhood } }));
}

export async function recentReviews(limit = 6): Promise<(ReviewWithUser & { mealSlug: string | null; cookName: string })[]> {
  const db = await getDb();
  const rows = await db
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
    .all();
  return rows.map((r) => ({
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

async function hydrateOrders(orderRows: (typeof schema.orders.$inferSelect)[]): Promise<OrderFull[]> {
  if (!orderRows.length) return [];
  const db = await getDb();
  const ids = orderRows.map((o) => o.id);
  const items = await db
    .select({ item: schema.orderItems, mealSlug: schema.meals.slug, imageKey: schema.meals.imageKey, cuisine: schema.meals.cuisine })
    .from(schema.orderItems)
    .innerJoin(schema.meals, eq(schema.orderItems.mealId, schema.meals.id))
    .where(inArray(schema.orderItems.orderId, ids))
    .all();
  const cookIds = [...new Set(orderRows.map((o) => o.cookId))];
  const cooks = await db.select().from(schema.cooks).where(inArray(schema.cooks.id, cookIds)).all();
  const userIds = [...new Set(orderRows.map((o) => o.userId))];
  const users = await db.select().from(schema.users).where(inArray(schema.users.id, userIds)).all();
  return orderRows.map((o) => {
    const u = users.find((u) => u.id === o.userId)!;
    return {
      ...o,
      items: items.filter((i) => i.item.orderId === o.id).map((i) => ({ ...i.item, mealSlug: i.mealSlug, imageKey: i.imageKey, cuisine: i.cuisine })),
      cook: cooks.find((c) => c.id === o.cookId)!,
      customer: { name: u.name, avatarHue: u.avatarHue, neighborhood: u.neighborhood, phone: u.phone },
    };
  });
}

export async function listOrdersForUser(userId: string): Promise<OrderFull[]> {
  const db = await getDb();
  const rows = await db.select().from(schema.orders).where(eq(schema.orders.userId, userId)).orderBy(desc(schema.orders.createdAt)).all();
  return hydrateOrders(rows);
}

export async function listOrdersForCook(cookId: string): Promise<OrderFull[]> {
  const db = await getDb();
  const rows = await db.select().from(schema.orders).where(eq(schema.orders.cookId, cookId)).orderBy(desc(schema.orders.createdAt)).all();
  return hydrateOrders(rows);
}

export async function getOrder(orderId: string): Promise<OrderFull | null> {
  const db = await getDb();
  const row = await db.select().from(schema.orders).where(eq(schema.orders.id, orderId)).get();
  return row ? (await hydrateOrders([row]))[0] : null;
}

export async function userHasReviewed(userId: string, mealId: string): Promise<Review | null> {
  const db = await getDb();
  return (await db.select().from(schema.reviews).where(and(eq(schema.reviews.userId, userId), eq(schema.reviews.mealId, mealId))).get()) ?? null;
}

export async function userFavorites(userId: string): Promise<Set<string>> {
  const db = await getDb();
  const rows = await db.select({ m: schema.favorites.mealId }).from(schema.favorites).where(eq(schema.favorites.userId, userId)).all();
  return new Set(rows.map((r) => r.m));
}

export async function listFavoriteMeals(userId: string): Promise<MealWithCook[]> {
  const ids = [...(await userFavorites(userId))];
  if (!ids.length) return [];
  const db = await getDb();
  const rows = await db
    .select({ meal: schema.meals, cook: schema.cooks })
    .from(schema.meals)
    .innerJoin(schema.cooks, eq(schema.meals.cookId, schema.cooks.id))
    .where(inArray(schema.meals.id, ids))
    .all();
  return rows.map((r) => ({ ...r.meal, cook: r.cook }));
}

export type PostWithAuthor = typeof schema.posts.$inferSelect & {
  author: Pick<User, "name" | "avatarHue" | "neighborhood">;
  replyCount: number;
};

export async function listPosts(neighborhood?: string, kind?: string): Promise<PostWithAuthor[]> {
  const db = await getDb();
  const conds = [];
  if (neighborhood) conds.push(eq(schema.posts.neighborhood, neighborhood));
  if (kind) conds.push(eq(schema.posts.kind, kind));
  const rows = await db
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
    .all();
  return rows.map((r) => ({ ...r.post, replyCount: Number(r.replyCount), author: { name: r.name, avatarHue: r.avatarHue, neighborhood: r.userNeighborhood } }));
}

export async function getPost(id: string): Promise<(PostWithAuthor & { replies: (typeof schema.replies.$inferSelect & { author: Pick<User, "name" | "avatarHue"> })[] }) | null> {
  const db = await getDb();
  const post = (await listPosts()).find((p) => p.id === id);
  if (!post) return null;
  const rows = await db
    .select({ reply: schema.replies, name: schema.users.name, avatarHue: schema.users.avatarHue })
    .from(schema.replies)
    .innerJoin(schema.users, eq(schema.replies.userId, schema.users.id))
    .where(eq(schema.replies.postId, id))
    .orderBy(schema.replies.createdAt)
    .all();
  return { ...post, replies: rows.map((r) => ({ ...r.reply, author: { name: r.name, avatarHue: r.avatarHue } })) };
}

export async function siteStats() {
  const db = await getDb();
  const n = async (q: Promise<{ n: number } | undefined>) => Number((await q)?.n ?? 0);
  const [cooks, meals, served, reviews] = await Promise.all([
    n(db.select({ n: sql<number>`count(*)` }).from(schema.cooks).where(eq(schema.cooks.active, true)).get()),
    n(db.select({ n: sql<number>`count(*)` }).from(schema.meals).where(eq(schema.meals.status, "active")).get()),
    n(db.select({ n: sql<number>`coalesce(sum(meals_served),0)` }).from(schema.cooks).get()),
    n(db.select({ n: sql<number>`count(*)` }).from(schema.reviews).get()),
  ]);
  return { cooks, meals, served, reviews };
}

export async function getIssueForOrder(orderId: string) {
  const db = await getDb();
  return (await db.select().from(schema.issues).where(eq(schema.issues.orderId, orderId)).get()) ?? null;
}

export async function listIssuesForCook(cookId: string) {
  const db = await getDb();
  return db
    .select({ issue: schema.issues, customer: schema.users.name })
    .from(schema.issues)
    .innerJoin(schema.users, eq(schema.issues.userId, schema.users.id))
    .where(and(eq(schema.issues.cookId, cookId), eq(schema.issues.status, "open")))
    .orderBy(desc(schema.issues.createdAt))
    .all();
}

export async function adminOverview() {
  const db = await getDb();
  const n = async (q: Promise<{ n: number } | undefined>) => Number((await q)?.n ?? 0);
  const [users, cooksN, mealsN, ordersN, gmvCents, feesCents, openIssues, waitlistN] = await Promise.all([
    n(db.select({ n: sql<number>`count(*)` }).from(schema.users).get()),
    n(db.select({ n: sql<number>`count(*)` }).from(schema.cooks).get()),
    n(db.select({ n: sql<number>`count(*)` }).from(schema.meals).get()),
    n(db.select({ n: sql<number>`count(*)` }).from(schema.orders).get()),
    n(db.select({ n: sql<number>`coalesce(sum(subtotal_cents),0)` }).from(schema.orders).where(sql`status != 'cancelled'`).get()),
    n(db.select({ n: sql<number>`coalesce(sum(fee_cents + delivery_cents),0)` }).from(schema.orders).where(sql`status != 'cancelled'`).get()),
    n(db.select({ n: sql<number>`count(*)` }).from(schema.issues).where(eq(schema.issues.status, "open")).get()),
    n(db.select({ n: sql<number>`count(*)` }).from(schema.waitlist).get()),
  ]);
  const totals = { users, cooks: cooksN, meals: mealsN, orders: ordersN, gmvCents, feesCents, openIssues, waitlist: waitlistN };
  const recentOrders = await hydrateOrders(await db.select().from(schema.orders).orderBy(desc(schema.orders.createdAt)).limit(15).all());
  const issues = await db
    .select({ issue: schema.issues, customer: schema.users.name, cook: schema.cooks.displayName })
    .from(schema.issues)
    .innerJoin(schema.users, eq(schema.issues.userId, schema.users.id))
    .innerJoin(schema.cooks, eq(schema.issues.cookId, schema.cooks.id))
    .orderBy(desc(schema.issues.createdAt))
    .limit(30)
    .all();
  const waitlistRows = await db.select().from(schema.waitlist).orderBy(desc(schema.waitlist.createdAt)).limit(50).all();
  const cooks = await db.select().from(schema.cooks).orderBy(desc(schema.cooks.createdAt)).all();
  const byNeighborhood = await db
    .select({ neighborhood: schema.cooks.neighborhood, orders: sql<number>`count(${schema.orders.id})`, gmv: sql<number>`coalesce(sum(${schema.orders.subtotalCents}),0)` })
    .from(schema.cooks)
    .leftJoin(schema.orders, eq(schema.orders.cookId, schema.cooks.id))
    .groupBy(schema.cooks.neighborhood)
    .all();
  return { totals, recentOrders, issues, waitlist: waitlistRows, cooks, byNeighborhood };
}
