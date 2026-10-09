import Link from "next/link";
import type { MealWithCook } from "@/lib/queries";
import { money, nextAvailableDay, FULFILLMENT_LABELS } from "@/lib/format";
import { Photo } from "./photo";
import { RatingStars } from "./rating-stars";
import { AddToCartButton } from "./cart/add-to-cart-button";

export function MealCard({ meal, showCook = true }: { meal: MealWithCook; showCook?: boolean }) {
  const next = nextAvailableDay(meal.availableDays);
  const soldOut = meal.portionsAvailable <= 0;
  return (
    <article className="card group flex flex-col overflow-hidden transition-transform duration-200 hover:-translate-y-0.5">
      <Link href={`/meals/${meal.slug}`} className="relative block aspect-[4/3] overflow-hidden bg-cream-deep">
        <Photo imageKey={meal.imageKey} alt={meal.title} fallbackLabel={meal.cuisine} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="transition-transform duration-500 group-hover:scale-[1.03]" />
        <div className="absolute left-3 top-3 flex gap-1.5">
          {next && (
            <span className={`rounded-full px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide shadow-sm ${next === "Today" ? "bg-tomato text-white" : "bg-paper/95 text-ink"}`}>
              {next === "Today" ? "Tonight" : next}
            </span>
          )}
          {meal.dietaryTags.slice(0, 1).map((t) => (
            <span key={t} className="rounded-full bg-sage-soft/95 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide text-sage shadow-sm">
              {t}
            </span>
          ))}
        </div>
        {soldOut && (
          <div className="absolute inset-0 flex items-center justify-center bg-ink/40">
            <span className="rounded-full bg-paper px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-ink">Sold out tonight</span>
          </div>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-bold leading-snug">
            <Link href={`/meals/${meal.slug}`} className="hover:text-tomato">
              {meal.title}
            </Link>
          </h3>
          <span className="shrink-0 font-display text-lg font-bold text-ink">{money(meal.priceCents)}</span>
        </div>
        {showCook && (
          <p className="mt-0.5 text-sm text-ink-soft">
            by{" "}
            <Link href={`/cooks/${meal.cook.slug}`} className="font-semibold text-ink hover:text-tomato">
              {meal.cook.displayName}
            </Link>{" "}
            · {meal.cook.neighborhood}
          </p>
        )}
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-soft">{meal.description}</p>
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-muted">
          <RatingStars value={meal.ratingAvg} count={meal.ratingCount} />
          <span>·</span>
          <span>Serves {meal.servings}</span>
          <span>·</span>
          <span>{meal.readyWindow}</span>
        </div>
        <div className="mt-auto flex items-center justify-between gap-2 pt-4">
          <div className="flex flex-wrap gap-1">
            {meal.fulfillment.map((f) => (
              <span key={f} className="chip">
                {FULFILLMENT_LABELS[f]?.short ?? f}
              </span>
            ))}
          </div>
          <AddToCartButton meal={meal} compact disabled={soldOut} />
        </div>
      </div>
    </article>
  );
}
