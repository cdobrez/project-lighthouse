import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Gig Kitchens",
    short_name: "Gig Kitchens",
    description: "Home-cooked meals from your neighbors.",
    start_url: "/",
    display: "standalone",
    background_color: "#fbf6ee",
    theme_color: "#c8502f",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
