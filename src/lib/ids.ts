import { randomBytes } from "node:crypto";

const ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789"; // no ambiguous 0/O/1/l/i

export function newId(prefix = ""): string {
  const bytes = randomBytes(12);
  let raw = "";
  for (const b of bytes) raw += ALPHABET[b % ALPHABET.length];
  return prefix ? `${prefix}_${raw}` : raw;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);
}
