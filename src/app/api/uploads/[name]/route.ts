import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { uploadsDir } from "@/lib/uploads";

export const runtime = "nodejs";

const MIME: Record<string, string> = { jpg: "image/jpeg", png: "image/png", webp: "image/webp" };

/** Serves photos stored on local disk (development and Docker). Vercel deployments use Blob URLs instead. */
export async function GET(_req: Request, ctx: RouteContext<"/api/uploads/[name]">) {
  const { name } = await ctx.params;
  if (!/^[A-Za-z0-9_.-]+$/.test(name)) return new NextResponse("Not found", { status: 404 });
  const ext = name.split(".").pop() ?? "";
  const type = MIME[ext];
  if (!type) return new NextResponse("Not found", { status: 404 });
  try {
    const data = await fs.readFile(path.join(uploadsDir(), name));
    return new NextResponse(new Uint8Array(data), { headers: { "Content-Type": type, "Cache-Control": "public, max-age=31536000, immutable" } });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
