"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb, schema } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function resolveIssue(issueId: string, status: "refunded" | "resolved") {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return { ok: false };
  getDb().update(schema.issues).set({ status }).where(eq(schema.issues.id, issueId)).run();
  revalidatePath("/admin");
  revalidatePath("/cook");
  return { ok: true };
}

export async function setCookActive(cookId: string, active: boolean) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return { ok: false };
  getDb().update(schema.cooks).set({ active }).where(eq(schema.cooks.id, cookId)).run();
  revalidatePath("/admin");
  revalidatePath("/cooks");
  revalidatePath("/meals");
  return { ok: true };
}
