import type { Metadata } from "next";
import { StaticPage } from "@/components/static-page";

export const metadata: Metadata = { title: "FAQ" };

const FAQS = [
  { q: "Who are the cooks?", a: "Neighbors. Parents, retirees, people who learned from a grandmother. Every cook is food-handler certified and has had their kitchen reviewed. Their profile tells you who they are and how long they've been cooking." },
  { q: "How far away is the food?", a: "Cooks serve their own neighborhood, usually within a mile or two. Pickup is on their porch. Drop-off and delivery radiuses are set by each cook." },
  { q: "What does it cost?", a: "The cook sets the price. You pay that plus an 8% neighborhood fee that keeps the lights on. Delivery is a flat $3.99. Tips go entirely to the cook." },
  { q: "What if I have an allergy?", a: "Every meal lists ingredients and allergens. Home kitchens are shared kitchens though, so if you have a severe allergy, message the cook first." },
  { q: "Can I cancel?", a: "Free cancellation until the cook marks the order as cooking. After that, the ingredients are in the pot." },
  { q: "What about the containers?", a: "Most cooks use reusable glass or deli containers. Rinse and return them at your next order. Some cooks ask for a small deposit." },
  { q: "How do ratings work?", a: "Only neighbors who ordered a meal can rate it. One rating per meal per person, and you can update it. Cooks see every rating." },
  { q: "I want to cook. What do I need?", a: "A food handler certificate (about two hours online, and we reimburse the fee after your fifth order), a clean kitchen, and one dish you are proud of. Start on the Become a cook page." },
  { q: "Is this legal where I live?", a: "Cottage food and home kitchen rules vary by state and county. We walk every cook through what applies to them during onboarding and keep our rules at least as strict as the local ones." },
];

export default function FaqPage() {
  return (
    <StaticPage eyebrow="FAQ" title="Questions neighbors ask">
      <dl className="divide-y divide-line">
        {FAQS.map((f) => (
          <div key={f.q} className="py-5">
            <dt className="text-lg font-bold">{f.q}</dt>
            <dd className="mt-1 text-ink-soft">{f.a}</dd>
          </div>
        ))}
      </dl>
    </StaticPage>
  );
}
