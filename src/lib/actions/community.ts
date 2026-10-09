"use server";

import { eq } from "drizzle-orm";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getDb, schema } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { newId } from "@/lib/ids";
import type { FormState } from "./auth";

const postSchema = z.object({
  kind: z.enum(["post", "recipe", "event", "request"]),
  title: z.string().trim().min(3, "Add a title").max(120),
  body: z.string().trim().min(10, "Say a little more (10+ characters)").max(2000),
  eventAt: z.string().trim().max(60).optional(),
});

export async function createPost(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Sign in to post to the neighborhood board." };
  const parsed = postSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data;
  getDb()
    .insert(schema.posts)
    .values({
      id: newId("post"),
      userId: user.id,
      neighborhood: user.neighborhood || "Maple Grove",
      kind: d.kind,
      title: d.title,
      body: d.body,
      eventAt: d.kind === "event" ? d.eventAt || null : null,
    })
    .run();
  revalidatePath("/community");
  return { ok: true };
}

export async function replyToPost(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Sign in to reply." };
  const postId = String(formData.get("postId") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  if (!postId || body.length < 2) return { error: "Write a reply first." };
  getDb().insert(schema.replies).values({ id: newId("rep"), postId, userId: user.id, body: body.slice(0, 1000) }).run();
  revalidatePath("/community");
  revalidatePath(`/community/${postId}`);
  return { ok: true };
}

export async function likePost(postId: string) {
  const user = await getCurrentUser();
  if (!user) return { ok: false };
  const db = getDb();
  const post = db.select().from(schema.posts).where(eq(schema.posts.id, postId)).get();
  if (!post) return { ok: false };
  db.update(schema.posts).set({ likes: post.likes + 1 }).where(eq(schema.posts.id, postId)).run();
  revalidatePath("/community");
  return { ok: true };
}
