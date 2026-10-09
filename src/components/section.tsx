export function Section({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={`mx-auto w-full max-w-7xl px-4 sm:px-6 ${className}`}>
      {children}
    </section>
  );
}

export function SectionHeading({ eyebrow, title, blurb, action }: { eyebrow?: string; title: string; blurb?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h2 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">{title}</h2>
        {blurb && <p className="mt-3 text-base leading-relaxed text-ink-soft">{blurb}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
