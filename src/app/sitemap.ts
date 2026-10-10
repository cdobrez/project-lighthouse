import type { MetadataRoute } from "next";
import { listMeals, listCooks } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.SITE_URL ?? "https://gigkitchens.com";
  const statics = ["", "/meals", "/cooks", "/community", "/how-it-works", "/about", "/safety", "/faq", "/contact", "/become-a-cook", "/neighborhoods", "/neighborhoods/maple-grove", "/neighborhoods/riverbend", "/neighborhoods/oak-hollow"].map((p) => ({
    url: `${base}${p}`,
    changeFrequency: "daily" as const,
    priority: p === "" ? 1 : 0.7,
  }));
  const meals = (await listMeals()).map((m) => ({ url: `${base}/meals/${m.slug}`, changeFrequency: "daily" as const, priority: 0.8 }));
  const cooks = (await listCooks()).map((c) => ({ url: `${base}/cooks/${c.slug}`, changeFrequency: "weekly" as const, priority: 0.6 }));
  return [...statics, ...meals, ...cooks];
}
