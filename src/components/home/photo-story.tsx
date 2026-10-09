import Link from "next/link";
import { Photo } from "@/components/photo";

type Props = {
  imageKey: string;
  eyebrow: string;
  title: string;
  body: string;
  caption?: string;
  cta?: { href: string; label: string };
  flip?: boolean;
  tone?: "cream" | "sage" | "butter";
};

export function PhotoStory({ imageKey, eyebrow, title, body, caption, cta, flip = false, tone = "cream" }: Props) {
  const bg = tone === "sage" ? "bg-sage-soft/50" : tone === "butter" ? "bg-butter-soft/60" : "bg-cream-deep/50";
  return (
    <section className={`${bg} py-16`}>
      <div className={`mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 ${flip ? "lg:[&>*:first-child]:order-2" : ""}`}>
        <figure className="relative">
          <div className="relative aspect-[16/11] overflow-hidden rounded-[2rem] shadow-[0_30px_60px_-30px_rgb(43_33_24/0.45)] ring-1 ring-line">
            <Photo imageKey={imageKey} sizes="(max-width: 1024px) 100vw, 50vw" />
          </div>
          {caption && (
            <figcaption className="card mx-4 -mt-6 p-4 text-center font-display text-base italic text-ink-soft sm:mx-8">{caption}</figcaption>
          )}
        </figure>
        <div>
          <p className="eyebrow mb-3">{eyebrow}</p>
          <h2 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">{title}</h2>
          <div className="prose-home mt-4 text-base leading-relaxed text-ink-soft">
            {body.split("\n\n").map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          {cta && (
            <Link href={cta.href} className="btn-primary mt-6">
              {cta.label}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
