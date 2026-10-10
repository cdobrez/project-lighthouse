import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMealBySlug, listReviewsForMeal, listMeals, userHasReviewed, userFavorites } from "@/lib/queries";
import { FavoriteButton } from "@/components/favorite-button";
import { getCurrentUser } from "@/lib/auth";
import { Photo } from "@/components/photo";
import { RatingStars } from "@/components/rating-stars";
import { Section } from "@/components/section";
import { MealCard } from "@/components/meal-card";
import { OrderPanel } from "@/components/meals/order-panel";
import { ReviewForm } from "@/components/reviews/review-form";
import { ReviewList } from "@/components/reviews/review-list";
import { DAY_ORDER } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: PageProps<"/meals/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const meal = await getMealBySlug(slug);
  if (!meal) return { title: "Meal not found" };
  return { title: `${meal.title} by ${meal.cook.displayName}`, description: meal.description };
}

export default async function MealPage(props: PageProps<"/meals/[slug]">) {
  const { slug } = await props.params;
  const meal = await getMealBySlug(slug);
  if (!meal) notFound();
  const [user] = await Promise.all([getCurrentUser()]);
  const reviews = await listReviewsForMeal(meal.id);
  const mine = user ? await userHasReviewed(user.id, meal.id) : null;
  const saved = user ? (await userFavorites(user.id)).has(meal.id) : false;
  const more = (await listMeals({})).filter((m) => m.cookId === meal.cookId && m.id !== meal.id).slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: meal.title,
    description: meal.description,
    image: `${process.env.SITE_URL ?? "https://gigkitchens.com"}/images/${meal.imageKey}.jpg`,
    brand: { "@type": "Organization", name: meal.cook.displayName },
    offers: { "@type": "Offer", priceCurrency: "USD", price: (meal.priceCents / 100).toFixed(2), availability: meal.portionsAvailable > 0 ? "https://schema.org/InStock" : "https://schema.org/SoldOut" },
    ...(meal.ratingCount > 0 ? { aggregateRating: { "@type": "AggregateRating", ratingValue: meal.ratingAvg, reviewCount: meal.ratingCount } } : {}),
  };

  return (
    <Section className="py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="mb-5 text-sm text-ink-muted" aria-label="Breadcrumb">
        <Link href="/meals" className="hover:text-tomato">
          Tonight&apos;s meals
        </Link>{" "}
        / <span className="text-ink">{meal.title}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          <div className="relative aspect-[16/10] overflow-hidden rounded-[2rem] ring-1 ring-line">
            <Photo imageKey={meal.imageKey} alt={meal.title} fallbackLabel={meal.cuisine} priority sizes="(max-width: 1024px) 100vw, 60vw" />
          </div>

          <div className="mt-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="chip">{meal.cuisine}</span>
              {meal.dietaryTags.map((t) => (
                <span key={t} className="chip bg-sage-soft text-sage">
                  {t}
                </span>
              ))}
            </div>
            <div className="mt-3 flex items-start justify-between gap-3">
              <h1 className="text-4xl font-bold leading-tight tracking-tight">{meal.title}</h1>
              <FavoriteButton mealId={meal.id} initial={saved} signedIn={Boolean(user)} />
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-soft">
              <RatingStars value={meal.ratingAvg} count={meal.ratingCount} size="md" />
              <span>·</span>
              <span>{meal.timesOrdered} ordered</span>
            </div>
            <p className="mt-4 text-lg leading-relaxed text-ink-soft">{meal.description}</p>
          </div>

          <Link href={`/cooks/${meal.cook.slug}`} className="card mt-6 flex items-center gap-4 p-4 transition-colors hover:bg-cream-deep/50">
            <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-cream-deep">
              <Photo imageKey={meal.cook.imageKey} alt={meal.cook.displayName} fallbackLabel="cook" sizes="64px" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-extrabold uppercase tracking-wider text-ink-muted">Cooked by</span>
              <span className="block text-lg font-bold">{meal.cook.displayName}</span>
              <span className="block truncate text-sm text-ink-soft">
                {meal.cook.neighborhood} · {meal.cook.yearsCooking} years cooking · {meal.cook.mealsServed.toLocaleString()} meals served
              </span>
            </span>
            <span className="btn-secondary hidden sm:inline-flex">Visit kitchen</span>
          </Link>

          {meal.story && (
            <blockquote className="mt-6 rounded-2xl border-l-4 border-butter bg-butter-soft/60 p-5 font-display text-lg italic leading-relaxed text-ink">
              “{meal.story}”<footer className="mt-2 font-sans text-sm not-italic text-ink-muted">— {meal.cook.displayName}</footer>
            </blockquote>
          )}

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <div>
              <h2 className="text-lg font-bold">What&apos;s in it</h2>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {meal.ingredients.map((i) => (
                  <li key={i} className="chip">
                    {i}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-lg font-bold">Allergens</h2>
              {meal.allergens.length ? (
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {meal.allergens.map((a) => (
                    <li key={a} className="chip bg-tomato-soft text-tomato-deep">
                      {a}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-ink-soft">No major allergens listed. Ask the cook if you have questions.</p>
              )}
              <h2 className="mt-5 text-lg font-bold">Cooking days</h2>
              <ul className="mt-2 flex gap-1">
                {DAY_ORDER.map((d) => (
                  <li
                    key={d}
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold ${meal.availableDays.includes(d) ? "bg-ink text-cream" : "bg-cream-deep text-ink-muted"}`}
                    aria-label={`${d}${meal.availableDays.includes(d) ? ", available" : ""}`}
                  >
                    {d.slice(0, 2)}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-10">
            <div className="flex items-end justify-between">
              <h2 className="text-2xl font-bold">Neighbors say</h2>
              <RatingStars value={meal.ratingAvg} count={meal.ratingCount} size="md" />
            </div>
            <div className="mt-4 grid gap-6 md:grid-cols-[1fr_320px]">
              <ReviewList reviews={reviews} />
              <div>
                {user ? (
                  <ReviewForm mealId={meal.id} existing={mine ? { rating: mine.rating, comment: mine.comment } : null} />
                ) : (
                  <div className="card p-5 text-sm">
                    <p className="font-bold">Tried it?</p>
                    <p className="mt-1 text-ink-soft">Sign in to rate this recipe and help your neighbors pick dinner.</p>
                    <Link href={`/login?next=/meals/${meal.slug}`} className="btn-secondary mt-3">
                      Sign in to rate
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <aside>
          <OrderPanel meal={meal} />
        </aside>
      </div>

      {more.length > 0 && (
        <div className="mt-14">
          <h2 className="text-2xl font-bold">More from {meal.cook.displayName}</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {more.map((m) => (
              <MealCard key={m.id} meal={m} showCook={false} />
            ))}
          </div>
        </div>
      )}
    </Section>
  );
}
