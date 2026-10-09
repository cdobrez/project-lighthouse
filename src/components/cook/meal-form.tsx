"use client";

import { useActionState } from "react";
import type { Meal } from "@/lib/db/schema";
import { createMeal, updateMeal } from "@/lib/actions/cook";
import { DAY_ORDER, FULFILLMENT_LABELS } from "@/lib/format";
import { MEAL_PHOTO_KEYS } from "@/lib/images";

export function MealForm({ meal, cookFulfillment }: { meal?: Meal | null; cookFulfillment: string[] }) {
  const bound = meal ? updateMeal.bind(null, meal.id) : createMeal;
  const [state, action, pending] = useActionState(bound, undefined);
  return (
    <form action={action} className="card space-y-5 p-6">
      <div className="grid gap-4 sm:grid-cols-[1fr_160px_120px]">
        <div>
          <label className="label" htmlFor="title">
            Meal name
          </label>
          <input id="title" name="title" className="input" defaultValue={meal?.title ?? ""} placeholder="Nonna's Baked Lasagna" required />
        </div>
        <div>
          <label className="label" htmlFor="price">
            Price ($)
          </label>
          <input id="price" name="price" type="number" step="0.5" min={1} className="input" defaultValue={meal ? meal.priceCents / 100 : 14} required />
        </div>
        <div>
          <label className="label" htmlFor="servings">
            Serves
          </label>
          <input id="servings" name="servings" type="number" min={1} max={20} className="input" defaultValue={meal?.servings ?? 1} />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="description">
          Description
        </label>
        <textarea id="description" name="description" rows={3} className="input" defaultValue={meal?.description ?? ""} placeholder="What's on the plate, how it's packed, what to do when it arrives." required />
      </div>
      <div>
        <label className="label" htmlFor="story">
          The story behind it (optional)
        </label>
        <textarea id="story" name="story" rows={2} className="input" defaultValue={meal?.story ?? ""} placeholder="Where the recipe came from. Neighbors love this part." />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="label" htmlFor="cuisine">
            Cuisine
          </label>
          <input id="cuisine" name="cuisine" className="input" defaultValue={meal?.cuisine ?? ""} placeholder="Italian" list="cuisines" required />
          <datalist id="cuisines">
            {["Italian", "Indian", "Mexican", "Vietnamese", "American", "Barbecue", "Mediterranean", "Chinese", "Thai", "Korean", "Dessert", "Soul"].map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>
        <div>
          <label className="label" htmlFor="dietaryTags">
            Dietary tags
          </label>
          <input id="dietaryTags" name="dietaryTags" className="input" defaultValue={meal?.dietaryTags.join(", ") ?? ""} placeholder="vegetarian, gluten-free" />
        </div>
        <div>
          <label className="label" htmlFor="allergens">
            Allergens
          </label>
          <input id="allergens" name="allergens" className="input" defaultValue={meal?.allergens.join(", ") ?? ""} placeholder="wheat, dairy" />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="ingredients">
          Ingredients (comma separated)
        </label>
        <input id="ingredients" name="ingredients" className="input" defaultValue={meal?.ingredients.join(", ") ?? ""} placeholder="fresh pasta, beef, tomatoes, parmesan" />
      </div>
      <fieldset>
        <legend className="label">Cooking days</legend>
        <div className="flex flex-wrap gap-1.5">
          {DAY_ORDER.map((d) => (
            <label key={d} className="cursor-pointer">
              <input type="checkbox" name="availableDays" value={d} defaultChecked={meal?.availableDays.includes(d) ?? false} className="peer sr-only" />
              <span className="inline-flex h-10 w-12 items-center justify-center rounded-full bg-cream-deep text-sm font-bold text-ink-soft peer-checked:bg-ink peer-checked:text-cream peer-focus-visible:ring-2 peer-focus-visible:ring-tomato">
                {d}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="label" htmlFor="readyWindow">
            Ready window
          </label>
          <input id="readyWindow" name="readyWindow" className="input" defaultValue={meal?.readyWindow ?? "5:00 - 7:00 pm"} required />
        </div>
        <div>
          <label className="label" htmlFor="portionsAvailable">
            Portions per cooking day
          </label>
          <input id="portionsAvailable" name="portionsAvailable" type="number" min={0} max={200} className="input" defaultValue={meal?.portionsAvailable ?? 10} />
        </div>
        <div>
          <label className="label" htmlFor="imageKey">
            Photo
          </label>
          <select id="imageKey" name="imageKey" className="input" defaultValue={meal?.imageKey ?? "meal-default"}>
            <option value="meal-default">Use an illustrated placeholder</option>
            {MEAL_PHOTO_KEYS.map((k) => (
              <option key={k} value={k}>
                {k.replace("meal-", "").replace(/-/g, " ")}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-ink-muted">Photo uploads are coming. For now pick a library photo or a placeholder.</p>
        </div>
      </div>
      <fieldset>
        <legend className="label">Hand-off options for this meal</legend>
        <div className="flex flex-wrap gap-2">
          {cookFulfillment.map((k) => (
            <label key={k} className="flex cursor-pointer items-center gap-2 rounded-full border border-line px-3 py-1.5 text-sm hover:bg-cream-deep/50">
              <input type="checkbox" name="fulfillment" value={k} defaultChecked={meal ? meal.fulfillment.includes(k) : true} className="accent-tomato" />
              {FULFILLMENT_LABELS[k]?.label ?? k}
            </label>
          ))}
        </div>
      </fieldset>
      {state?.error && <p className="rounded-xl bg-tomato-soft p-3 text-sm font-semibold text-tomato-deep">{state.error}</p>}
      {state?.ok && <p className="rounded-xl bg-sage-soft p-3 text-sm font-semibold text-sage">Meal saved.</p>}
      <button type="submit" className="btn-primary py-3 text-base" disabled={pending}>
        {pending ? "Saving…" : meal ? "Save changes" : "List this meal"}
      </button>
    </form>
  );
}
