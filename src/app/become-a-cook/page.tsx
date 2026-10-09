import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, getCurrentCook } from "@/lib/auth";
import { CookForm } from "@/components/cook/cook-form";
import { Photo } from "@/components/photo";
import { Section } from "@/components/section";
import { EarningsCalculator } from "@/components/cook/earnings-calculator";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Become a cook",
  description: "Turn the meals you already make into extra income. Cook from home, on your schedule, for neighbors a few streets away.",
};

const PERKS = [
  { emoji: "🕒", title: "Your schedule", body: "List a dish for the nights you're already cooking. One night a week is plenty to start." },
  { emoji: "💸", title: "Keep 92%", body: "You set the price. We keep an 8% neighborhood fee to run the platform. Tips are all yours." },
  { emoji: "🏡", title: "No storefront", body: "Pickup from your porch, a short walk to drop off, or let a neighbor courier handle delivery." },
  { emoji: "🧾", title: "We handle the boring parts", body: "Payments, order updates, ratings, and a simple dashboard that works on your phone." },
];

export default async function BecomeACookPage() {
  const user = await getCurrentUser();
  const cook = await getCurrentCook();
  if (cook) redirect("/cook");

  return (
    <>
      <div className="bg-butter-soft/60">
        <Section className="grid items-center gap-10 py-14 lg:grid-cols-2">
          <div>
            <p className="eyebrow mb-3">Cook with us</p>
            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">Already cooking for your family? Cook for the block.</h1>
            <p className="mt-4 text-lg text-ink-soft">
              Make a double batch of what you were making anyway. List it by noon, hand it off at dinner, earn real money from your own kitchen.
            </p>
            <a href="#apply" className="btn-primary mt-6 py-3 text-base">
              Open my kitchen
            </a>
          </div>
          <div className="relative aspect-[16/11] overflow-hidden rounded-[2rem] ring-1 ring-line">
            <Photo imageKey="scene-cook-packing" priority sizes="(max-width: 1024px) 100vw, 50vw" />
          </div>
        </Section>
      </div>

      <Section className="py-14">
        <div className="grid gap-5 md:grid-cols-4">
          {PERKS.map((p) => (
            <div key={p.title} className="card p-5">
              <span className="text-3xl" aria-hidden>
                {p.emoji}
              </span>
              <h2 className="mt-3 text-lg font-bold">{p.title}</h2>
              <p className="mt-1 text-sm text-ink-soft">{p.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section className="pb-14">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">What could you earn?</h2>
            <p className="mt-2 text-ink-soft">Most cooks start with one dish on one night. Here&apos;s the math.</p>
            <div className="mt-5">
              <EarningsCalculator />
            </div>
            <div className="card mt-6 p-5 text-sm">
              <h3 className="font-bold">What we ask of every cook</h3>
              <ul className="mt-2 space-y-1.5 text-ink-soft">
                <li>• A food handler certificate (online, about two hours; we reimburse the fee after your fifth order).</li>
                <li>• A short video walkthrough of your kitchen so we can mark you as reviewed.</li>
                <li>• Honest ingredient and allergen lists on every meal.</li>
                <li>• Meals packed in clean, labeled containers. Reusable glass is encouraged.</li>
              </ul>
              <Link href="/safety" className="mt-3 inline-block font-bold text-tomato hover:underline">
                Read our food safety standards →
              </Link>
            </div>
          </div>
          <div id="apply">
            <h2 className="text-3xl font-bold tracking-tight">Set up your kitchen</h2>
            {user ? (
              <div className="mt-5">
                <CookForm />
              </div>
            ) : (
              <div className="card mt-5 p-6">
                <p className="font-bold">First, create a free account</p>
                <p className="mt-1 text-sm text-ink-soft">Your cook profile hangs off your neighbor account. It takes thirty seconds.</p>
                <div className="mt-4 flex gap-2">
                  <Link href="/signup?next=/become-a-cook" className="btn-primary">
                    Create account
                  </Link>
                  <Link href="/login?next=/become-a-cook" className="btn-secondary">
                    Sign in
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </Section>
    </>
  );
}
