import type { Metadata } from "next";
import { Suspense } from "react";
import { listMeals, listCuisines, type MealFilters as Filters } from "@/lib/queries";
import { MealCard } from "@/components/meal-card";
import { MealFilters } from "@/components/meals/filters";
import { Section } from "@/components/section";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tonight's meals",
  description: "Browse home-cooked dinners available for pickup, drop-off or delivery in your neighborhood.",
};

const SORTS = new Set(["popular", "rating", "price-asc", "price-desc", "newest"]);

export default async function MealsPage(props: PageProps<"/meals">) {
  const sp = await props.searchParams;
  const pick = (k: string) => {
    const v = sp[k];
    return typeof v === "string" ? v : undefined;
  };
  const sortRaw = pick("sort");
  const filters: Filters = {
    q: pick("q"),
    cuisine: pick("cuisine"),
    diet: pick("diet"),
    fulfillment: pick("fulfillment"),
    neighborhood: pick("neighborhood"),
    day: pick("day"),
    sort: sortRaw && SORTS.has(sortRaw) ? (sortRaw as Filters["sort"]) : "popular",
  };
  const meals = listMeals(filters);
  const cuisines = listCuisines();

  return (
    <Section className="py-10">
      <div className="mb-8">
        <p className="eyebrow mb-2">Tonight&apos;s menu</p>
        <h1 className="text-4xl font-bold tracking-tight">
          {filters.neighborhood ? `Cooking in ${filters.neighborhood}` : "What's cooking nearby"}
        </h1>
        <p className="mt-2 max-w-2xl text-ink-soft">
          Small batches from neighborhood kitchens. Pick a day, choose how you want it handed off, and order before portions run out.
        </p>
      </div>
      <div className="grid gap-8 lg:grid-cols-[290px_1fr]">
        <aside>
          <Suspense>
            <MealFilters cuisines={cuisines} total={meals.length} />
          </Suspense>
        </aside>
        <div>
          {meals.length === 0 ? (
            <div className="card p-10 text-center">
              <p className="text-4xl" aria-hidden>
                🍽️
              </p>
              <h2 className="mt-3 text-xl font-bold">Nothing matches those filters yet</h2>
              <p className="mt-2 text-sm text-ink-soft">Try another day or neighborhood, or post a request on the community board. Someone nearby probably makes it.</p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {meals.map((m) => (
                <MealCard key={m.id} meal={m} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}
