import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { CheckoutForm } from "@/components/cart/checkout-form";
import { Section } from "@/components/section";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/checkout");
  return (
    <Section className="py-10">
      <p className="eyebrow mb-2">Checkout</p>
      <h1 className="text-4xl font-bold tracking-tight">How do you want it?</h1>
      <div className="mt-8">
        <CheckoutForm user={{ name: user.name, address: user.address, neighborhood: user.neighborhood, phone: user.phone }} />
      </div>
    </Section>
  );
}
