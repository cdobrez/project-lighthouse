import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { storeImage } from "@/lib/uploads";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  const form = await req.formData();
  const file = form.get("file");
  const kind = String(form.get("kind") ?? "meal");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file received." }, { status: 400 });
  const folder = kind === "cook" ? `cooks/${user.id}` : `meals/${user.id}`;
  const result = await storeImage(file, folder);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ url: result.url });
}
