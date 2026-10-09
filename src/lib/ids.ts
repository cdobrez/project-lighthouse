import { randomBytes } from "node:crypto";

export function newId(prefix = ""): string {
  const raw = randomBytes(9).toString("base64url");
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
