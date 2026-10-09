import Link from "next/link";
import type { Cook } from "@/lib/db/schema";
import { Photo } from "./photo";
import { RatingStars } from "./rating-stars";
import { FULFILLMENT_LABELS } from "@/lib/format";

export function CookCard({ cook, mealCount }: { cook: Cook; mealCount?: number }) {
  return (
    <article className="card flex gap-4 p-4 transition-transform duration-200 hover:-translate-y-0.5">
      <Link href={`/cooks/${cook.slug}`} className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-cream-deep sm:h-28 sm:w-28">
        <Photo imageKey={cook.imageKey} alt={cook.displayName} fallbackLabel="cook" fallbackHue={30} sizes="112px" />
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-lg font-bold leading-tight">
              <Link href={`/cooks/${cook.slug}`} className="hover:text-tomato">
                {cook.displayName}
              </Link>
            </h3>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{cook.neighborhood}</p>
          </div>
          {cook.kitchenInspected && (
            <span className="chip bg-sage-soft text-sage" title="Kitchen reviewed by Gig Kitchens">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M20 6L9 17l-5-5" />
              </svg>
              Verified
            </span>
          )}
        </div>
        <p className="mt-1 line-clamp-2 text-sm italic text-ink-soft">“{cook.tagline}”</p>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-muted">
          <RatingStars value={cook.ratingAvg} count={cook.ratingCount} />
          {typeof mealCount === "number" && (
            <>
              <span>·</span>
              <span>
                {mealCount} {mealCount === 1 ? "meal" : "meals"}
              </span>
            </>
          )}
          <span>·</span>
          <span>{cook.mealsServed.toLocaleString()} served</span>
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {cook.specialties.slice(0, 3).map((s) => (
            <span key={s} className="chip">
              {s}
            </span>
          ))}
          {cook.fulfillment.includes("delivery") && <span className="chip bg-butter-soft text-ink-soft">{FULFILLMENT_LABELS.delivery.short}</span>}
        </div>
      </div>
    </article>
  );
}
