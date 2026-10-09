"use client";

import { useActionState } from "react";
import type { Cook } from "@/lib/db/schema";
import { becomeCook, updateCookProfile } from "@/lib/actions/cook";
import { NEIGHBORHOODS } from "@/lib/neighborhoods";
import { FULFILLMENT_LABELS } from "@/lib/format";

export function CookForm({ cook }: { cook?: Cook | null }) {
  const [state, action, pending] = useActionState(cook ? updateCookProfile : becomeCook, undefined);
  return (
    <form action={action} className="card space-y-5 p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="displayName">
            Kitchen name
          </label>
          <input id="displayName" name="displayName" className="input" defaultValue={cook?.displayName ?? ""} placeholder="Rosa's Kitchen" required />
        </div>
        <div>
          <label className="label" htmlFor="yearsCooking">
            Years cooking
          </label>
          <input id="yearsCooking" name="yearsCooking" type="number" min={0} max={80} className="input" defaultValue={cook?.yearsCooking ?? 5} />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="tagline">
          Tagline
        </label>
        <input id="tagline" name="tagline" className="input" defaultValue={cook?.tagline ?? ""} placeholder="Sunday-sauce Italian, the way my nonna made it" required />
      </div>
      <div>
        <label className="label" htmlFor="bio">
          About you
        </label>
        <textarea id="bio" name="bio" rows={4} className="input" defaultValue={cook?.bio ?? ""} placeholder="Who you are, what you love to cook, who you usually cook for." required />
      </div>
      <div>
        <label className="label" htmlFor="kitchenStory">
          Your kitchen (optional)
        </label>
        <textarea id="kitchenStory" name="kitchenStory" rows={2} className="input" defaultValue={cook?.kitchenStory ?? ""} placeholder="A little picture of where the food gets made." />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="label" htmlFor="neighborhood">
            Neighborhood
          </label>
          <select id="neighborhood" name="neighborhood" className="input" defaultValue={cook?.neighborhood ?? NEIGHBORHOODS[0].name}>
            {NEIGHBORHOODS.map((n) => (
              <option key={n.name} value={n.name}>
                {n.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="zip">
            ZIP
          </label>
          <input id="zip" name="zip" className="input" defaultValue={cook?.zip ?? NEIGHBORHOODS[0].zip} pattern="\d{5}" required />
        </div>
        <div>
          <label className="label" htmlFor="specialties">
            Specialties (comma separated)
          </label>
          <input id="specialties" name="specialties" className="input" defaultValue={cook?.specialties.join(", ") ?? ""} placeholder="Italian, Baked pasta" />
        </div>
      </div>
      <fieldset>
        <legend className="label">How you hand off meals</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {Object.entries(FULFILLMENT_LABELS).map(([k, v]) => (
            <label key={k} className="flex cursor-pointer items-start gap-2 rounded-xl border border-line p-3 text-sm hover:bg-cream-deep/50">
              <input type="checkbox" name="fulfillment" value={k} defaultChecked={cook ? cook.fulfillment.includes(k) : k === "pickup"} className="mt-0.5 accent-tomato" />
              <span>
                <span className="block font-bold">{v.label}</span>
                <span className="text-xs text-ink-soft">{v.blurb}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="deliveryRadiusMiles">
            Delivery / drop-off radius (miles)
          </label>
          <input id="deliveryRadiusMiles" name="deliveryRadiusMiles" type="number" step="0.5" min={0.5} max={25} className="input" defaultValue={cook?.deliveryRadiusMiles ?? 3} />
        </div>
        <label className="flex items-center gap-2 self-end rounded-xl border border-line p-3 text-sm">
          <input type="checkbox" name="foodHandlerCertified" defaultChecked={cook?.foodHandlerCertified ?? false} className="accent-tomato" />
          <span>
            <span className="font-bold">I hold a food handler certificate</span>
            <span className="block text-xs text-ink-soft">We&apos;ll ask for a photo of it before your first sale.</span>
          </span>
        </label>
      </div>
      {state?.error && <p className="rounded-xl bg-tomato-soft p-3 text-sm font-semibold text-tomato-deep">{state.error}</p>}
      {state?.ok && <p className="rounded-xl bg-sage-soft p-3 text-sm font-semibold text-sage">Profile saved.</p>}
      <button type="submit" className="btn-primary py-3 text-base" disabled={pending}>
        {pending ? "Saving…" : cook ? "Save profile" : "Open my kitchen"}
      </button>
    </form>
  );
}
