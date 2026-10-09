"use server";

import { z } from "zod";
import { getDb, schema } from "@/lib/db";
import { newId } from "@/lib/ids";
import type { FormState } from "./auth";

const waitlistSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  zip: z.string().trim().regex(/^\d{5}$/, "Enter a 5-digit ZIP"),
  neighborhood: z.string().trim().max(80).default(""),
  wantsToCook: z.string().optional(),
  note: z.string().trim().max(500).default(""),
});

export async function joinWaitlist(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = waitlistSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data;
  getDb()
    .insert(schema.waitlist)
    .values({ id: newId("wl"), email: d.email, zip: d.zip, neighborhood: d.neighborhood, wantsToCook: d.wantsToCook === "on", note: d.note })
    .run();
  return { ok: true };
}
