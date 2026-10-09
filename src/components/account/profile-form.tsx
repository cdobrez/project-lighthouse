"use client";

import { useActionState } from "react";
import { updateProfile } from "@/lib/actions/auth";
import { NEIGHBORHOODS } from "@/lib/neighborhoods";

export function ProfileForm({ user }: { user: { name: string; neighborhood: string; zip: string; address: string; phone: string } }) {
  const [state, action, pending] = useActionState(updateProfile, undefined);
  return (
    <form action={action} className="card p-5">
      <label className="label" htmlFor="p-name">
        Name
      </label>
      <input id="p-name" name="name" className="input" defaultValue={user.name} required />
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="p-neighborhood">
            Neighborhood
          </label>
          <select id="p-neighborhood" name="neighborhood" className="input" defaultValue={user.neighborhood}>
            {NEIGHBORHOODS.map((n) => (
              <option key={n.name} value={n.name}>
                {n.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="p-zip">
            ZIP
          </label>
          <input id="p-zip" name="zip" className="input" defaultValue={user.zip} pattern="\d{5}" required />
        </div>
      </div>
      <label className="label mt-4" htmlFor="p-address">
        Home address (for drop-off &amp; delivery)
      </label>
      <input id="p-address" name="address" className="input" defaultValue={user.address} />
      <label className="label mt-4" htmlFor="p-phone">
        Phone
      </label>
      <input id="p-phone" name="phone" className="input" defaultValue={user.phone} type="tel" />
      {state?.error && <p className="mt-3 text-sm font-semibold text-tomato-deep">{state.error}</p>}
      {state?.ok && <p className="mt-3 text-sm font-semibold text-sage">Saved.</p>}
      <button type="submit" className="btn-primary mt-4" disabled={pending}>
        {pending ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}
