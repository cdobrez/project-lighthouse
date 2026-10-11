import { NextResponse } from "next/server";
import { runStandingOrders } from "@/lib/standing-orders";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Daily job (Vercel Cron) that places this week's standing orders. Protected by CRON_SECRET. */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) return new NextResponse("Unauthorized", { status: 401 });
  const result = await runStandingOrders();
  return NextResponse.json(result);
}
