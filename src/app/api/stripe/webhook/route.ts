import { NextResponse } from "next/server";
import { stripe, isStripeConfigured } from "@/lib/stripe";
import { confirmPayment } from "@/lib/actions/orders";

export const runtime = "nodejs";

/** Stripe → Gig Kitchens. Configure the endpoint in Stripe for the event `checkout.session.completed`. */
export async function POST(req: Request) {
  if (!isStripeConfigured() || !process.env.STRIPE_WEBHOOK_SECRET) return new NextResponse("Stripe not configured", { status: 503 });
  const signature = req.headers.get("stripe-signature");
  if (!signature) return new NextResponse("Missing signature", { status: 400 });
  const payload = await req.text();
  let event;
  try {
    event = stripe().webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("[gigkitchens] stripe webhook signature failed", err);
    return new NextResponse("Bad signature", { status: 400 });
  }
  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    const session = event.data.object;
    const orderId = session.metadata?.orderId ?? session.client_reference_id;
    if (orderId && session.payment_status === "paid") {
      const ref = typeof session.payment_intent === "string" ? session.payment_intent : session.id;
      await confirmPayment(orderId, ref);
    }
  }
  return NextResponse.json({ received: true });
}
