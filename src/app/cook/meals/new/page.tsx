import type { Metadata } from "next";
import { requireCook } from "@/lib/auth";
import { MealForm } from "@/components/cook/meal-form";

export const metadata: Metadata = { title: "Add a meal" };

export default async function NewMealPage() {
  const cook = await requireCook();
  return (
    <div className="max-w-3xl">
      <h2 className="text-xl font-bold">List a new meal</h2>
      <p className="mb-4 text-sm text-ink-soft">Be specific about what&apos;s in it. Neighbors with allergies and picky kids will thank you.</p>
      <MealForm cookFulfillment={cook.fulfillment} />
    </div>
  );
}
