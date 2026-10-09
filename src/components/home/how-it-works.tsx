import { Section, SectionHeading } from "@/components/section";

const STEPS = [
  {
    n: "1",
    title: "See what's cooking nearby",
    body: "Browse tonight's menu from home cooks within a few blocks. Every meal lists ingredients, allergens, and the cook's story.",
    emoji: "🏘️",
  },
  {
    n: "2",
    title: "Pick how you want it",
    body: "Swing by the porch, let the cook drop it at your door, or have a neighbor courier bring it over. Pay once, no tipping guilt.",
    emoji: "🚲",
  },
  {
    n: "3",
    title: "Eat, rate, repeat",
    body: "Sit down to real food. Rate the recipe, thank the cook, and return the dish next time. The best cooks rise to the top.",
    emoji: "⭐",
  },
];

export function HowItWorks() {
  return (
    <Section className="py-16" id="how-it-works">
      <SectionHeading eyebrow="How it works" title="Three steps between you and a real dinner" />
      <ol className="grid gap-5 md:grid-cols-3">
        {STEPS.map((s) => (
          <li key={s.n} className="card relative p-6">
            <span className="absolute right-5 top-5 font-display text-5xl font-bold text-cream-deep" aria-hidden>
              {s.n}
            </span>
            <span className="text-3xl" aria-hidden>
              {s.emoji}
            </span>
            <h3 className="mt-4 text-xl font-bold">{s.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{s.body}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
