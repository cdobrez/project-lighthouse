"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, signup } from "@/lib/actions/auth";
import { NEIGHBORHOODS } from "@/lib/neighborhoods";

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(login, undefined);
  return (
    <form action={action} className="card p-6">
      {next && <input type="hidden" name="next" value={next} />}
      <label className="label" htmlFor="email">
        Email
      </label>
      <input id="email" name="email" type="email" autoComplete="email" className="input" required />
      <label className="label mt-4" htmlFor="password">
        Password
      </label>
      <input id="password" name="password" type="password" autoComplete="current-password" className="input" required />
      {state?.error && <p className="mt-3 rounded-xl bg-tomato-soft p-3 text-sm font-semibold text-tomato-deep">{state.error}</p>}
      <button type="submit" className="btn-primary mt-5 w-full py-3 text-base" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
      <p className="mt-4 text-center text-sm text-ink-soft">
        New here?{" "}
        <Link href={next ? `/signup?next=${encodeURIComponent(next)}` : "/signup"} className="font-bold text-tomato hover:underline">
          Create an account
        </Link>
      </p>
      <div className="mt-5 rounded-xl bg-cream-deep p-3 text-xs text-ink-soft">
        <p className="font-bold text-ink">Demo accounts (password: neighbor123)</p>
        <p className="mt-1">
          Neighbor: <code>demo@gigkitchens.com</code>
        </p>
        <p>
          Cook: <code>rosa@example.com</code>
        </p>
      </div>
    </form>
  );
}

export function SignupForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(signup, undefined);
  return (
    <form action={action} className="card p-6">
      {next && <input type="hidden" name="next" value={next} />}
      <label className="label" htmlFor="name">
        Your name
      </label>
      <input id="name" name="name" autoComplete="name" className="input" required />
      <label className="label mt-4" htmlFor="email">
        Email
      </label>
      <input id="email" name="email" type="email" autoComplete="email" className="input" required />
      <label className="label mt-4" htmlFor="password">
        Password
      </label>
      <input id="password" name="password" type="password" autoComplete="new-password" minLength={8} className="input" required />
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="neighborhood">
            Neighborhood
          </label>
          <select id="neighborhood" name="neighborhood" className="input" defaultValue={NEIGHBORHOODS[0].name}>
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
          <input id="zip" name="zip" inputMode="numeric" pattern="\d{5}" className="input" defaultValue={NEIGHBORHOODS[0].zip} required />
        </div>
      </div>
      {state?.error && <p className="mt-3 rounded-xl bg-tomato-soft p-3 text-sm font-semibold text-tomato-deep">{state.error}</p>}
      <button type="submit" className="btn-primary mt-5 w-full py-3 text-base" disabled={pending}>
        {pending ? "Creating…" : "Join the neighborhood"}
      </button>
      <p className="mt-4 text-center text-sm text-ink-soft">
        Already have an account?{" "}
        <Link href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"} className="font-bold text-tomato hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
