"use server";

import { z } from "zod";
import { getDb, schema } from "@/lib/db";
import { newId } from "@/lib/ids";
import type { FormState } from "./auth";
import { rateLimit } from "@/lib/rate-limit";

const waitlistSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  zip: z.string().trim().regex(/^\d{5}$/, "Enter a 5-digit ZIP"),
  neighborhood: z.string().trim().max(80).default(""),
  wantsToCook: z.string().optional(),
  note: z.string().trim().max(500).default(""),
});

export async function joinWaitlist(_prev: FormState, formData: FormData): Promise<FormState> {
  const limit = await rateLimit("waitlist", 5, 60 * 60 * 1000);
  if (!limit.ok) return { error: "You're on the list already. We'll be in touch." };
  const parsed = waitlistSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data;
  (await getDb())
    .insert(schema.waitlist)
    .values({ id: newId("wl"), email: d.email, zip: d.zip, neighborhood: d.neighborhood, wantsToCook: d.wantsToCook === "on", note: d.note })
    .run();
  return { ok: true };
}
