"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb, schema } from "@/lib/db";
import { createSession, destroySession, getCurrentUser } from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/password";
import { newId } from "@/lib/ids";
import { NEIGHBORHOODS } from "@/lib/neighborhoods";
import { notifyWelcome } from "@/lib/notifications";
import { rateLimit } from "@/lib/rate-limit";

export type FormState = { error?: string; ok?: boolean } | undefined;

const signupSchema = z.object({
  name: z.string().trim().min(2, "Tell us your name").max(80),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(8, "Use at least 8 characters"),
  neighborhood: z.string().trim().min(1, "Pick your neighborhood"),
  zip: z.string().trim().regex(/^\d{5}$/, "Enter a 5-digit ZIP"),
  next: z.string().optional(),
});

export async function signup(_prev: FormState, formData: FormData): Promise<FormState> {
  const limit = await rateLimit("signup", 10, 60 * 60 * 1000);
  if (!limit.ok) return { error: "Too many sign-ups from this connection. Try again in a bit." };
  const parsed = signupSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { name, email, password, neighborhood, zip, next } = parsed.data;
  const db = await getDb();
  const existing = await db.select({ id: schema.users.id }).from(schema.users).where(eq(schema.users.email, email)).get();
  if (existing) return { error: "There is already an account with that email. Try signing in." };
  const id = newId("usr");
  await db.insert(schema.users)
    .values({
      id,
      name,
      email,
      passwordHash: hashPassword(password),
      neighborhood,
      zip,
      avatarHue: Math.floor(Math.random() * 360),
    })
    .run();
  await createSession(id);
  void notifyWelcome(email, name);
  redirect(safeNext(next) ?? "/meals");
}

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
  next: z.string().optional(),
});

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const limit = await rateLimit("login", 20, 15 * 60 * 1000);
  if (!limit.ok) return { error: `Too many attempts. Try again in ${Math.ceil(limit.retryAfterSec / 60)} minutes.` };
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { email, password, next } = parsed.data;
  const db = await getDb();
  const user = await db.select().from(schema.users).where(eq(schema.users.email, email)).get();
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return { error: "That email and password don't match." };
  }
  await createSession(user.id);
  redirect(safeNext(next) ?? "/meals");
}

export async function logout() {
  await destroySession();
  redirect("/");
}

const profileSchema = z.object({
  name: z.string().trim().min(2).max(80),
  neighborhood: z.string().trim().min(1),
  zip: z.string().trim().regex(/^\d{5}$/, "Enter a 5-digit ZIP"),
  address: z.string().trim().max(200).default(""),
  phone: z.string().trim().max(30).default(""),
});

export async function updateProfile(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account");
  const parsed = profileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  (await getDb()).update(schema.users).set(parsed.data).where(eq(schema.users.id, user.id)).run();
  return { ok: true };
}

function safeNext(next?: string): string | undefined {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return undefined;
  return next;
}

export async function listNeighborhoods() {
  return NEIGHBORHOODS;
}
