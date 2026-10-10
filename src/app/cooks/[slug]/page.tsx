import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCookBySlug, listReviewsForCook } from "@/lib/queries";
import { Photo } from "@/components/photo";
import { RatingStars } from "@/components/rating-stars";
import { Section } from "@/components/section";
import { MealCard } from "@/components/meal-card";
import { ReviewList } from "@/components/reviews/review-list";
import { FULFILLMENT_LABELS } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: PageProps<"/cooks/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const cook = await getCookBySlug(slug);
  return cook ? { title: cook.displayName, description: cook.tagline } : { title: "Cook not found" };
}

export default async function CookPage(props: PageProps<"/cooks/[slug]">) {
  const { slug } = await props.params;
  const cook = await getCookBySlug(slug);
  if (!cook) notFound();
  const reviews = await listReviewsForCook(cook.id);
  const activeMeals = cook.meals.filter((m) => m.status === "active").map((m) => ({ ...m, cook }));

  return (
    <>
      <div className="bg-cream-deep/50">
        <Section className="py-10">
          <div className="grid items-center gap-8 md:grid-cols-[220px_1fr]">
            <div className="relative aspect-square overflow-hidden rounded-[2rem] ring-4 ring-paper shadow-[var(--shadow-card)]">
              <Photo imageKey={cook.imageKey} alt={cook.displayName} fallbackLabel="cook" priority sizes="220px" />
            </div>
            <div>
              <p className="eyebrow mb-2">{cook.neighborhood} · {cook.zip}</p>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{cook.displayName}</h1>
              <p className="mt-2 font-display text-xl italic text-ink-soft">“{cook.tagline}”</p>
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                <RatingStars value={cook.ratingAvg} count={cook.ratingCount} size="md" />
                <span className="text-ink-muted">{cook.mealsServed.toLocaleString()} meals served</span>
                <span className="text-ink-muted">{cook.yearsCooking} years cooking</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {cook.foodHandlerCertified && <span className="chip bg-sage-soft text-sage">✓ Food handler certified</span>}
                {cook.kitchenInspected && <span className="chip bg-sage-soft text-sage">✓ Kitchen reviewed</span>}
                {cook.fulfillment.map((f) => (
                  <span key={f} className="chip">
                    {FULFILLMENT_LABELS[f]?.label ?? f}
                  </span>
                ))}
                {cook.fulfillment.includes("delivery") && <span className="chip">{cook.deliveryRadiusMiles} mi radius</span>}
              </div>
            </div>
          </div>
        </Section>
      </div>

      <Section className="py-10">
        <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
          <div>
            <h2 className="text-2xl font-bold">On the menu</h2>
            {activeMeals.length ? (
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                {activeMeals.map((m) => (
                  <MealCard key={m.id} meal={m} showCook={false} />
                ))}
              </div>
            ) : (
              <p className="mt-3 text-ink-soft">Nothing listed right now. Check back soon.</p>
            )}

            <h2 className="mt-12 text-2xl font-bold">What neighbors say</h2>
            <div className="mt-4">
              <ReviewList reviews={reviews} showMeal />
            </div>
          </div>
          <aside className="space-y-6">
            <div className="card p-5">
              <h2 className="text-lg font-bold">About {cook.user.name.split(" ")[0]}</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{cook.bio}</p>
              {cook.kitchenStory && (
                <>
                  <h3 className="mt-4 text-sm font-extrabold uppercase tracking-wider text-ink-muted">The kitchen</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-soft">{cook.kitchenStory}</p>
                </>
              )}
              <h3 className="mt-4 text-sm font-extrabold uppercase tracking-wider text-ink-muted">Specialties</h3>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {cook.specialties.map((s) => (
                  <span key={s} className="chip">
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div className="card bg-butter-soft/60 p-5 text-sm">
              <p className="font-bold">Have a request?</p>
              <p className="mt-1 text-ink-soft">Ask for a dish you miss on the community board. Cooks read it, and the good requests become next week&apos;s menu.</p>
              <Link href="/community?kind=request" className="btn-secondary mt-3">
                Post a request
              </Link>
            </div>
          </aside>
        </div>
      </Section>
    </>
  );
}
