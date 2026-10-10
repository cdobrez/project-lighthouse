import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output is for the Docker image; Vercel builds its own output.
  output: process.env.VERCEL ? undefined : "standalone",
  serverExternalPackages: ["@libsql/client"],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
