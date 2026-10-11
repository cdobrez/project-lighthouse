import "server-only";
import Stripe from "stripe";

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

let client: Stripe | undefined;
export function stripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error("Stripe is not configured");
  client ??= new Stripe(process.env.STRIPE_SECRET_KEY);
  return client;
}

export type CheckoutLine = { title: string; qty: number; unitCents: number; imageUrl?: string };

/** Creates a hosted Stripe Checkout session for an order and returns its URL. */
export async function createCheckoutSession(input: {
  orderId: string;
  customerEmail: string;
  lines: CheckoutLine[];
  feeCents: number;
  deliveryCents: number;
  tipCents: number;
  cookName: string;
}): Promise<string> {
  const base = process.env.SITE_URL ?? "https://gigkitchens.com";
  const extras: CheckoutLine[] = [];
  if (input.feeCents > 0) extras.push({ title: "Neighborhood fee", qty: 1, unitCents: input.feeCents });
  if (input.deliveryCents > 0) extras.push({ title: "Delivery", qty: 1, unitCents: input.deliveryCents });
  if (input.tipCents > 0) extras.push({ title: `Tip for ${input.cookName}`, qty: 1, unitCents: input.tipCents });
  const session = await stripe().checkout.sessions.create({
    mode: "payment",
    customer_email: input.customerEmail,
    client_reference_id: input.orderId,
    metadata: { orderId: input.orderId },
    success_url: `${base}/orders/${input.orderId}?paid=1&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/orders/${input.orderId}?cancelled=1`,
    line_items: [...input.lines, ...extras].map((l) => ({
      quantity: l.qty,
      price_data: {
        currency: "usd",
        unit_amount: l.unitCents,
        product_data: { name: l.title, ...(l.imageUrl?.startsWith("https://") ? { images: [l.imageUrl] } : {}) },
      },
    })),
  });
  if (!session.url) throw new Error("Stripe did not return a checkout URL");
  return session.url;
}

/** Looks a Checkout session up and reports whether it was paid for the given order. */
export async function checkoutSessionPaid(sessionId: string, orderId: string): Promise<{ paid: boolean; paymentRef: string }> {
  const session = await stripe().checkout.sessions.retrieve(sessionId);
  const paid = session.payment_status === "paid" && (session.metadata?.orderId === orderId || session.client_reference_id === orderId);
  const ref = typeof session.payment_intent === "string" ? session.payment_intent : (session.payment_intent?.id ?? session.id);
  return { paid, paymentRef: ref };
}
