import type { Metadata } from "next";
import Link from "next/link";
import { StaticPage } from "@/components/static-page";
import { Photo } from "@/components/photo";
import { FULFILLMENT_LABELS } from "@/lib/format";

export const metadata: Metadata = { title: "How it works", description: "How ordering a home-cooked meal from a neighbor works, from browsing to the empty dish." };

const STEPS = [
  { title: "Browse tonight's menu", body: "Cooks post what they're making by noon. You see the dish, the ingredients, the allergens, the price, and how many portions are left.", photo: "meal-lasagna" },
  { title: "Choose your hand-off", body: "Pick up from the cook's porch, have it dropped at your door, or get it delivered by a neighbor courier. The ready window is on every listing.", photo: "scene-pickup" },
  { title: "Pay once, no haggling", body: "Price plus an 8% neighborhood fee. Delivery is a flat $3.99. Tips go 100% to the cook. Cancel free until they start cooking.", photo: "scene-cook-packing" },
  { title: "Eat at your own table", body: "Food arrives hot in a labeled, reusable container. Sit down, eat, and rinse the dish for next time.", photo: "scene-family-table" },
  { title: "Rate the recipe", body: "Your rating is tied to a real order, so there are no fake reviews. The best cooks and dishes rise to the top of the neighborhood.", photo: "scene-clean-kitchen" },
];

export default function HowItWorksPage() {
  return (
    <StaticPage eyebrow="How it works" title="From someone's stove to your table, in five steps" wide>
      <ol className="space-y-10">
        {STEPS.map((s, i) => (
          <li key={s.title} className={`grid items-center gap-6 md:grid-cols-2 ${i % 2 ? "md:[&>*:first-child]:order-2" : ""}`}>
            <div className="relative aspect-[16/10] overflow-hidden rounded-[1.5rem] ring-1 ring-line">
              <Photo imageKey={s.photo} sizes="(max-width: 768px) 100vw, 50vw" />
            </div>
            <div>
              <span className="font-display text-5xl font-bold text-tomato-soft">{i + 1}</span>
              <h2 className="text-2xl font-bold">{s.title}</h2>
              <p className="mt-2 text-ink-soft">{s.body}</p>
            </div>
          </li>
        ))}
      </ol>
      <div className="card mt-14 grid gap-4 p-6 md:grid-cols-3">
        {Object.entries(FULFILLMENT_LABELS).map(([k, v]) => (
          <div key={k}>
            <h3 className="font-bold">{v.label}</h3>
            <p className="text-sm text-ink-soft">{v.blurb}</p>
          </div>
        ))}
      </div>
      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/meals" className="btn-primary">
          See tonight&apos;s meals
        </Link>
        <Link href="/faq" className="btn-secondary">
          Read the FAQ
        </Link>
      </div>
    </StaticPage>
  );
}
