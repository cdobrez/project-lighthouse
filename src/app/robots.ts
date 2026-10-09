import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.SITE_URL ?? "https://gigkitchens.com";
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/account", "/orders", "/cook", "/checkout", "/cart", "/admin"] }],
    sitemap: `${base}/sitemap.xml`,
  };
}
