import { sqliteTable, text, integer, real, index } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("customer"), // customer | admin
  neighborhood: text("neighborhood").notNull().default(""),
  zip: text("zip").notNull().default(""),
  address: text("address").notNull().default(""),
  phone: text("phone").notNull().default(""),
  avatarHue: integer("avatar_hue").notNull().default(20),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
});

export const cooks = sqliteTable(
  "cooks",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => users.id),
    displayName: text("display_name").notNull(),
    slug: text("slug").notNull().unique(),
    tagline: text("tagline").notNull().default(""),
    bio: text("bio").notNull().default(""),
    kitchenStory: text("kitchen_story").notNull().default(""),
    neighborhood: text("neighborhood").notNull(),
    zip: text("zip").notNull(),
    specialties: text("specialties", { mode: "json" }).$type<string[]>().notNull().default([]),
    fulfillment: text("fulfillment", { mode: "json" }).$type<string[]>().notNull().default(["pickup"]),
    deliveryRadiusMiles: real("delivery_radius_miles").notNull().default(3),
    foodHandlerCertified: integer("food_handler_certified", { mode: "boolean" }).notNull().default(false),
    kitchenInspected: integer("kitchen_inspected", { mode: "boolean" }).notNull().default(false),
    yearsCooking: integer("years_cooking").notNull().default(1),
    imageKey: text("image_key").notNull().default("cook-default"),
    ratingAvg: real("rating_avg").notNull().default(0),
    ratingCount: integer("rating_count").notNull().default(0),
    mealsServed: integer("meals_served").notNull().default(0),
    active: integer("active", { mode: "boolean" }).notNull().default(true),
    createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
  },
  (t) => [index("cooks_zip_idx").on(t.zip), index("cooks_user_idx").on(t.userId)]
);

export const meals = sqliteTable(
  "meals",
  {
    id: text("id").primaryKey(),
    cookId: text("cook_id").notNull().references(() => cooks.id),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description").notNull(),
    story: text("story").notNull().default(""),
    cuisine: text("cuisine").notNull(),
    priceCents: integer("price_cents").notNull(),
    servings: integer("servings").notNull().default(1),
    dietaryTags: text("dietary_tags", { mode: "json" }).$type<string[]>().notNull().default([]),
    ingredients: text("ingredients", { mode: "json" }).$type<string[]>().notNull().default([]),
    allergens: text("allergens", { mode: "json" }).$type<string[]>().notNull().default([]),
    imageKey: text("image_key").notNull().default("meal-default"),
    availableDays: text("available_days", { mode: "json" }).$type<string[]>().notNull().default([]),
    readyWindow: text("ready_window").notNull().default("5:00 - 7:00 pm"),
    portionsAvailable: integer("portions_available").notNull().default(10),
    fulfillment: text("fulfillment", { mode: "json" }).$type<string[]>().notNull().default(["pickup"]),
    status: text("status").notNull().default("active"), // active | paused
    ratingAvg: real("rating_avg").notNull().default(0),
    ratingCount: integer("rating_count").notNull().default(0),
    timesOrdered: integer("times_ordered").notNull().default(0),
    createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
  },
  (t) => [index("meals_cook_idx").on(t.cookId), index("meals_status_idx").on(t.status)]
);

export const orders = sqliteTable(
  "orders",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => users.id),
    cookId: text("cook_id").notNull().references(() => cooks.id),
    status: text("status").notNull().default("placed"),
    fulfillment: text("fulfillment").notNull(), // pickup | dropoff | delivery
    address: text("address").notNull().default(""),
    scheduledFor: text("scheduled_for").notNull(),
    note: text("note").notNull().default(""),
    subtotalCents: integer("subtotal_cents").notNull(),
    feeCents: integer("fee_cents").notNull().default(0),
    deliveryCents: integer("delivery_cents").notNull().default(0),
    tipCents: integer("tip_cents").notNull().default(0),
    totalCents: integer("total_cents").notNull(),
    paymentRef: text("payment_ref").notNull().default(""),
    createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
    updatedAt: text("updated_at").notNull().default(sql`(datetime('now'))`),
  },
  (t) => [index("orders_user_idx").on(t.userId), index("orders_cook_idx").on(t.cookId)]
);

export const orderItems = sqliteTable(
  "order_items",
  {
    id: text("id").primaryKey(),
    orderId: text("order_id").notNull().references(() => orders.id),
    mealId: text("meal_id").notNull().references(() => meals.id),
    title: text("title").notNull(),
    qty: integer("qty").notNull(),
    unitCents: integer("unit_cents").notNull(),
  },
  (t) => [index("order_items_order_idx").on(t.orderId)]
);

export const reviews = sqliteTable(
  "reviews",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => users.id),
    cookId: text("cook_id").notNull().references(() => cooks.id),
    mealId: text("meal_id").references(() => meals.id),
    orderId: text("order_id").references(() => orders.id),
    rating: integer("rating").notNull(),
    comment: text("comment").notNull().default(""),
    createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
  },
  (t) => [index("reviews_meal_idx").on(t.mealId), index("reviews_cook_idx").on(t.cookId)]
);

export const posts = sqliteTable(
  "posts",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => users.id),
    neighborhood: text("neighborhood").notNull(),
    kind: text("kind").notNull().default("post"), // post | recipe | event | request
    title: text("title").notNull(),
    body: text("body").notNull(),
    eventAt: text("event_at"),
    likes: integer("likes").notNull().default(0),
    createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
  },
  (t) => [index("posts_neighborhood_idx").on(t.neighborhood)]
);

export const replies = sqliteTable(
  "replies",
  {
    id: text("id").primaryKey(),
    postId: text("post_id").notNull().references(() => posts.id),
    userId: text("user_id").notNull().references(() => users.id),
    body: text("body").notNull(),
    createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
  },
  (t) => [index("replies_post_idx").on(t.postId)]
);

export const favorites = sqliteTable(
  "favorites",
  {
    userId: text("user_id").notNull().references(() => users.id),
    mealId: text("meal_id").notNull().references(() => meals.id),
    createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
  },
  (t) => [index("favorites_user_idx").on(t.userId)]
);

export type User = typeof users.$inferSelect;
export type Cook = typeof cooks.$inferSelect;
export type Meal = typeof meals.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type Reply = typeof replies.$inferSelect;
