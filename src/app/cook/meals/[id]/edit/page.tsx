import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { requireCook } from "@/lib/auth";
import { getDb, schema } from "@/lib/db";
import { MealForm } from "@/components/cook/meal-form";

export const metadata: Metadata = { title: "Edit meal" };

export default async function EditMealPage(props: PageProps<"/cook/meals/[id]/edit">) {
  const { id } = await props.params;
  const cook = await requireCook();
  const meal = getDb().select().from(schema.meals).where(and(eq(schema.meals.id, id), eq(schema.meals.cookId, cook.id))).get();
  if (!meal) notFound();
  return (
    <div className="max-w-3xl">
      <h2 className="text-xl font-bold">Edit {meal.title}</h2>
      <div className="mt-4">
        <MealForm meal={meal} cookFulfillment={cook.fulfillment} />
      </div>
    </div>
  );
}
