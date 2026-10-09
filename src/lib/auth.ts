import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import { eq } from "drizzle-orm";
import { cache } from "react";
import { getDb, schema } from "@/lib/db";

const COOKIE = "gk_session";
const SESSION_DAYS = 30;

function secret(): Uint8Array {
  const s = process.env.SESSION_SECRET ?? "dev-only-gigkitchens-secret-change-me";
  return new TextEncoder().encode(s);
}

export { hashPassword, verifyPassword } from "@/lib/password";

export async function createSession(userId: string) {
  const token = await new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(secret());
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function destroySession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export const getCurrentUser = cache(async () => {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    const id = payload.sub;
    if (!id) return null;
    const db = getDb();
    const user = db.select().from(schema.users).where(eq(schema.users.id, id)).get();
    return user ?? null;
  } catch {
    return null;
  }
});

export const getCurrentCook = cache(async () => {
  const user = await getCurrentUser();
  if (!user) return null;
  const db = getDb();
  return db.select().from(schema.cooks).where(eq(schema.cooks.userId, user.id)).get() ?? null;
});

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHENTICATED");
  return user;
}

export async function requireCook() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/cook");
  const cook = await getCurrentCook();
  if (!cook) redirect("/become-a-cook");
  return cook;
}
