"use client";

import { useActionState, useState } from "react";
import { createPost } from "@/lib/actions/community";

const KINDS = [
  { value: "post", label: "Story", hint: "Something good that happened over dinner." },
  { value: "request", label: "Looking for", hint: "A dish you miss. Cooks read these." },
  { value: "recipe", label: "Recipe tip", hint: "A trick worth passing on." },
  { value: "event", label: "Event", hint: "Potluck, block party, cook-along." },
];

export function PostForm({ neighborhood, initialKind = "post" }: { neighborhood: string; initialKind?: string }) {
  const [state, action, pending] = useActionState(createPost, undefined);
  const [kind, setKind] = useState(initialKind);
  if (state?.ok) {
    return <div className="rounded-2xl bg-sage-soft p-4 text-sm font-semibold text-sage">Posted to the {neighborhood} board.</div>;
  }
  return (
    <form action={action} className="card p-5">
      <p className="font-bold">Post to the {neighborhood} board</p>
      <div className="mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        {KINDS.map((k) => (
          <label key={k.value} className={`cursor-pointer rounded-xl border p-2 text-center text-xs font-bold ${kind === k.value ? "border-tomato bg-tomato-soft/40 text-ink" : "border-line text-ink-soft"}`}>
            <input type="radio" name="kind" value={k.value} className="sr-only" checked={kind === k.value} onChange={() => setKind(k.value)} />
            {k.label}
          </label>
        ))}
      </div>
      <p className="mt-1 text-xs text-ink-muted">{KINDS.find((k) => k.value === kind)?.hint}</p>
      <input name="title" className="input mt-3" placeholder="Title" required maxLength={120} />
      <textarea name="body" rows={3} className="input mt-2" placeholder="Say a little more…" required maxLength={2000} />
      {kind === "event" && <input name="eventAt" className="input mt-2" placeholder="When? e.g. Saturday 5:00 pm, Maple Grove Park" maxLength={60} />}
      {state?.error && <p className="mt-2 text-sm font-semibold text-tomato-deep">{state.error}</p>}
      <button type="submit" className="btn-primary mt-3" disabled={pending}>
        {pending ? "Posting…" : "Post"}
      </button>
    </form>
  );
}
