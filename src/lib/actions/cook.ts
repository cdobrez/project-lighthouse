"use server";

import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getDb, schema } from "@/lib/db";
import { getCurrentUser, getCurrentCook } from "@/lib/auth";
import { newId, slugify } from "@/lib/ids";
import type { FormState } from "./auth";

const list = (v: unknown) =>
  typeof v === "string"
    ? v
        .split(/[,\n]/)
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

const cookSchema = z.object({
  displayName: z.string().trim().min(2, "Give your kitchen a name").max(60),
  tagline: z.string().trim().min(4, "Add a short tagline").max(120),
  bio: z.string().trim().min(20, "Tell neighbors a little about you (20+ characters)").max(1200),
  kitchenStory: z.string().trim().max(800).default(""),
  neighborhood: z.string().trim().min(1, "Pick your neighborhood"),
  zip: z.string().trim().regex(/^\d{5}$/, "Enter a 5-digit ZIP"),
  specialties: z.string().default(""),
  yearsCooking: z.coerce.number().int().min(0).max(80).default(1),
  fulfillment: z.array(z.string()).min(1, "Pick at least one way to hand off meals"),
  deliveryRadiusMiles: z.coerce.number().min(0.5).max(25).default(3),
  foodHandlerCertified: z.boolean().default(false),
});

function readCookForm(formData: FormData) {
  return cookSchema.safeParse({
    displayName: formData.get("displayName"),
    tagline: formData.get("tagline"),
    bio: formData.get("bio"),
    kitchenStory: formData.get("kitchenStory") ?? "",
    neighborhood: formData.get("neighborhood"),
    zip: formData.get("zip"),
    specialties: formData.get("specialties") ?? "",
    yearsCooking: formData.get("yearsCooking") ?? 1,
    fulfillment: formData.getAll("fulfillment").map(String),
    deliveryRadiusMiles: formData.get("deliveryRadiusMiles") ?? 3,
    foodHandlerCertified: formData.get("foodHandlerCertified") === "on",
  });
}

export async function becomeCook(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/become-a-cook");
  const existing = await getCurrentCook();
  if (existing) redirect("/cook");
  const parsed = readCookForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data;
  const db = getDb();
  let slug = slugify(d.displayName) || `kitchen-${newId()}`;
  if (db.select({ id: schema.cooks.id }).from(schema.cooks).where(eq(schema.cooks.slug, slug)).get()) slug = `${slug}-${newId().slice(0, 4).toLowerCase()}`;
  db.insert(schema.cooks)
    .values({
      id: newId("cook"),
      userId: user.id,
      displayName: d.displayName,
      slug,
      tagline: d.tagline,
      bio: d.bio,
      kitchenStory: d.kitchenStory,
      neighborhood: d.neighborhood,
      zip: d.zip,
      specialties: list(d.specialties),
      fulfillment: d.fulfillment,
      deliveryRadiusMiles: d.deliveryRadiusMiles,
      foodHandlerCertified: d.foodHandlerCertified,
      yearsCooking: d.yearsCooking,
      imageKey: "cook-default",
    })
    .run();
  revalidatePath("/cooks");
  redirect("/cook?welcome=1");
}

export async function updateCookProfile(_prev: FormState, formData: FormData): Promise<FormState> {
  const cook = await getCurrentCook();
  if (!cook) redirect("/become-a-cook");
  const parsed = readCookForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data;
  getDb()
    .update(schema.cooks)
    .set({
      displayName: d.displayName,
      tagline: d.tagline,
      bio: d.bio,
      kitchenStory: d.kitchenStory,
      neighborhood: d.neighborhood,
      zip: d.zip,
      specialties: list(d.specialties),
      fulfillment: d.fulfillment,
      deliveryRadiusMiles: d.deliveryRadiusMiles,
      foodHandlerCertified: d.foodHandlerCertified,
      yearsCooking: d.yearsCooking,
    })
    .where(eq(schema.cooks.id, cook.id))
    .run();
  revalidatePath("/cooks");
  revalidatePath(`/cooks/${cook.slug}`);
  revalidatePath("/cook");
  return { ok: true };
}

const mealSchema = z.object({
  title: z.string().trim().min(3, "Give the meal a name").max(80),
  description: z.string().trim().min(20, "Describe the meal (20+ characters)").max(1000),
  story: z.string().trim().max(600).default(""),
  cuisine: z.string().trim().min(2, "Add a cuisine").max(40),
  price: z.coerce.number().min(1, "Set a price").max(500),
  servings: z.coerce.number().int().min(1).max(20).default(1),
  dietaryTags: z.string().default(""),
  ingredients: z.string().default(""),
  allergens: z.string().default(""),
  availableDays: z.array(z.string()).min(1, "Pick at least one day"),
  readyWindow: z.string().trim().min(3, "Add a ready window").max(40),
  portionsAvailable: z.coerce.number().int().min(0).max(200).default(10),
  fulfillment: z.array(z.string()).min(1, "Pick at least one hand-off option"),
  imageKey: z.string().trim().max(80).default("meal-default"),
});

function readMealForm(formData: FormData) {
  return mealSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    story: formData.get("story") ?? "",
    cuisine: formData.get("cuisine"),
    price: formData.get("price"),
    servings: formData.get("servings") ?? 1,
    dietaryTags: formData.get("dietaryTags") ?? "",
    ingredients: formData.get("ingredients") ?? "",
    allergens: formData.get("allergens") ?? "",
    availableDays: formData.getAll("availableDays").map(String),
    readyWindow: formData.get("readyWindow"),
    portionsAvailable: formData.get("portionsAvailable") ?? 10,
    fulfillment: formData.getAll("fulfillment").map(String),
    imageKey: formData.get("imageKey") ?? "meal-default",
  });
}

export async function createMeal(_prev: FormState, formData: FormData): Promise<FormState> {
  const cook = await getCurrentCook();
  if (!cook) redirect("/become-a-cook");
  const parsed = readMealForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data;
  const db = getDb();
  let slug = slugify(d.title) || `meal-${newId()}`;
  if (db.select({ id: schema.meals.id }).from(schema.meals).where(eq(schema.meals.slug, slug)).get()) slug = `${slug}-${newId().slice(0, 4).toLowerCase()}`;
  db.insert(schema.meals)
    .values({
      id: newId("meal"),
      cookId: cook.id,
      title: d.title,
      slug,
      description: d.description,
      story: d.story,
      cuisine: d.cuisine,
      priceCents: Math.round(d.price * 100),
      servings: d.servings,
      dietaryTags: list(d.dietaryTags),
      ingredients: list(d.ingredients),
      allergens: list(d.allergens),
      imageKey: d.imageKey || "meal-default",
      availableDays: d.availableDays,
      readyWindow: d.readyWindow,
      portionsAvailable: d.portionsAvailable,
      fulfillment: d.fulfillment,
    })
    .run();
  revalidatePath("/meals");
  revalidatePath("/cook");
  redirect("/cook/meals");
}

export async function updateMeal(mealId: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const cook = await getCurrentCook();
  if (!cook) redirect("/become-a-cook");
  const db = getDb();
  const meal = db.select().from(schema.meals).where(and(eq(schema.meals.id, mealId), eq(schema.meals.cookId, cook.id))).get();
  if (!meal) return { error: "Meal not found." };
  const parsed = readMealForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data;
  db.update(schema.meals)
    .set({
      title: d.title,
      description: d.description,
      story: d.story,
      cuisine: d.cuisine,
      priceCents: Math.round(d.price * 100),
      servings: d.servings,
      dietaryTags: list(d.dietaryTags),
      ingredients: list(d.ingredients),
      allergens: list(d.allergens),
      imageKey: d.imageKey || meal.imageKey,
      availableDays: d.availableDays,
      readyWindow: d.readyWindow,
      portionsAvailable: d.portionsAvailable,
      fulfillment: d.fulfillment,
    })
    .where(eq(schema.meals.id, mealId))
    .run();
  revalidatePath("/meals");
  revalidatePath(`/meals/${meal.slug}`);
  revalidatePath("/cook");
  return { ok: true };
}

export async function toggleMealStatus(mealId: string) {
  const cook = await getCurrentCook();
  if (!cook) return { ok: false };
  const db = getDb();
  const meal = db.select().from(schema.meals).where(and(eq(schema.meals.id, mealId), eq(schema.meals.cookId, cook.id))).get();
  if (!meal) return { ok: false };
  db.update(schema.meals).set({ status: meal.status === "active" ? "paused" : "active" }).where(eq(schema.meals.id, mealId)).run();
  revalidatePath("/meals");
  revalidatePath("/cook/meals");
  return { ok: true };
}
