import { Section } from "./section";

export function StaticPage({ eyebrow, title, blurb, children, wide = false }: { eyebrow: string; title: string; blurb?: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <Section className={`py-12 ${wide ? "" : "max-w-4xl"}`}>
      <p className="eyebrow mb-2">{eyebrow}</p>
      <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">{title}</h1>
      {blurb && <p className="mt-3 max-w-2xl text-lg text-ink-soft">{blurb}</p>}
      <div className="mt-8">{children}</div>
    </Section>
  );
}

export function Prose({ children }: { children: React.ReactNode }) {
  return <div className="space-y-4 text-base leading-relaxed text-ink-soft [&_h2]:mt-8 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-ink [&_h3]:mt-5 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-ink [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-ink">{children}</div>;
}
