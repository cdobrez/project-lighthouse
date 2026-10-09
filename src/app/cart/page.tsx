import type { Metadata } from "next";
import { CartView } from "@/components/cart/cart-view";
import { Section } from "@/components/section";

export const metadata: Metadata = { title: "Your basket" };

export default function CartPage() {
  return (
    <Section className="py-10">
      <p className="eyebrow mb-2">Your basket</p>
      <h1 className="text-4xl font-bold tracking-tight">Almost dinner</h1>
      <div className="mt-8">
        <CartView />
      </div>
    </Section>
  );
}
