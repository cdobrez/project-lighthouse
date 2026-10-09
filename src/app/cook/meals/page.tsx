import type { Metadata } from "next";
import Link from "next/link";
import { requireCook } from "@/lib/auth";
import { getCookBySlug } from "@/lib/queries";
import { Photo } from "@/components/photo";
import { RatingStars } from "@/components/rating-stars";
import { MealStatusToggle } from "@/components/cook/meal-status-toggle";
import { money } from "@/lib/format";

export const metadata: Metadata = { title: "My meals" };

export default async function CookMealsPage() {
  const cook = await requireCook();
  const full = getCookBySlug(cook.slug)!;
  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Your menu</h2>
        <Link href="/cook/meals/new" className="btn-primary">
          + Add a meal
        </Link>
      </div>
      {full.meals.length === 0 ? (
        <div className="card mt-4 p-8 text-center">
          <p className="text-4xl" aria-hidden>
            🍳
          </p>
          <p className="mt-2 font-bold">Nothing on the menu yet</p>
          <p className="text-sm text-ink-soft">Start with the dish your family asks for most.</p>
        </div>
      ) : (
        <ul className="mt-4 grid gap-4 md:grid-cols-2">
          {full.meals.map((m) => (
            <li key={m.id} className={`card flex gap-4 p-4 ${m.status === "paused" ? "opacity-70" : ""}`}>
              <span className="relative h-24 w-28 shrink-0 overflow-hidden rounded-xl bg-cream-deep">
                <Photo imageKey={m.imageKey} alt={m.title} fallbackLabel={m.cuisine} sizes="112px" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-bold">{m.title}</p>
                  <span className="font-display font-bold">{money(m.priceCents)}</span>
                </div>
                <p className="text-xs text-ink-muted">
                  {m.availableDays.join(" · ")} · {m.readyWindow}
                </p>
                <div className="mt-1 flex items-center gap-2 text-xs text-ink-muted">
                  <RatingStars value={m.ratingAvg} count={m.ratingCount} />
                  <span>· {m.portionsAvailable} portions left</span>
                  <span className={`chip ${m.status === "active" ? "bg-sage-soft text-sage" : ""}`}>{m.status}</span>
                </div>
                <div className="mt-2 flex gap-1">
                  <Link href={`/cook/meals/${m.id}/edit`} className="btn-secondary px-3 py-1.5 text-xs">
                    Edit
                  </Link>
                  <MealStatusToggle mealId={m.id} status={m.status} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
