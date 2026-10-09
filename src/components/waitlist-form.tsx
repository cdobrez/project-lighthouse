"use client";

import { useActionState } from "react";
import { joinWaitlist } from "@/lib/actions/waitlist";

export function WaitlistForm({ compact = false }: { compact?: boolean }) {
  const [state, action, pending] = useActionState(joinWaitlist, undefined);
  if (state?.ok) {
    return (
      <div className="rounded-2xl bg-sage-soft p-4 text-sm font-semibold text-sage">
        You&apos;re on the list. We&apos;ll email you the moment a cook opens up on your street.
      </div>
    );
  }
  return (
    <form action={action} className={compact ? "" : "card p-5"}>
      {!compact && (
        <>
          <p className="font-bold">Bring Gig Kitchens to your street</p>
          <p className="mt-1 text-sm text-ink-soft">Tell us where you are. We open new neighborhoods as soon as a few neighbors and one cook sign up.</p>
        </>
      )}
      <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_110px]">
        <input name="email" type="email" className="input" placeholder="you@example.com" required aria-label="Email" />
        <input name="zip" className="input" placeholder="ZIP" pattern="\d{5}" required aria-label="ZIP code" />
      </div>
      <input name="neighborhood" className="input mt-2" placeholder="Neighborhood or town (optional)" aria-label="Neighborhood" />
      <label className="mt-2 flex items-center gap-2 text-sm">
        <input type="checkbox" name="wantsToCook" className="accent-tomato" /> I&apos;d like to cook for my neighbors
      </label>
      {state?.error && <p className="mt-2 text-sm font-semibold text-tomato-deep">{state.error}</p>}
      <button type="submit" className="btn-primary mt-3" disabled={pending}>
        {pending ? "Adding…" : "Notify me"}
      </button>
    </form>
  );
}
