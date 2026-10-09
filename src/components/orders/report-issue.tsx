"use client";

import { useActionState, useState } from "react";
import { reportIssue } from "@/lib/actions/issues";

const KINDS = [
  { value: "late", label: "Arrived late" },
  { value: "cold", label: "Arrived cold" },
  { value: "missing", label: "Something was missing" },
  { value: "not_as_described", label: "Not as described" },
  { value: "other", label: "Something else" },
];

export function ReportIssue({ orderId, existing }: { orderId: string; existing: { kind: string; status: string } | null }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(reportIssue, undefined);

  if (existing || state?.ok) {
    return (
      <div className="card bg-butter-soft/60 p-4 text-sm">
        <p className="font-bold">Thanks, we&apos;re on it.</p>
        <p className="mt-1 text-ink-soft">
          We&apos;ve let the cook know and will follow up within a day. Problems reported within 24 hours of hand-off are refunded in full.
          {existing?.status === "refunded" && " This order has been refunded."}
        </p>
      </div>
    );
  }

  if (!open) {
    return (
      <button type="button" className="btn-ghost text-xs" onClick={() => setOpen(true)}>
        Something wrong with this order? Report a problem
      </button>
    );
  }

  return (
    <form action={action} className="card p-4">
      <input type="hidden" name="orderId" value={orderId} />
      <p className="font-bold">What went wrong?</p>
      <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
        {KINDS.map((k) => (
          <label key={k.value} className="flex cursor-pointer items-center gap-2 rounded-xl border border-line px-3 py-2 text-sm hover:bg-cream-deep/50">
            <input type="radio" name="kind" value={k.value} required className="accent-tomato" />
            {k.label}
          </label>
        ))}
      </div>
      <textarea name="details" rows={2} className="input mt-2" placeholder="Anything that helps us make it right." maxLength={1000} />
      {state?.error && <p className="mt-2 text-sm font-semibold text-tomato-deep">{state.error}</p>}
      <div className="mt-3 flex gap-2">
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? "Sending…" : "Send report"}
        </button>
        <button type="button" className="btn-ghost" onClick={() => setOpen(false)}>
          Never mind
        </button>
      </div>
    </form>
  );
}
