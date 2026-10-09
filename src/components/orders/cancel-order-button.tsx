"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { cancelMyOrder } from "@/lib/actions/orders";

export function CancelOrderButton({ orderId }: { orderId: string }) {
  const [pending, start] = useTransition();
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  if (!confirm) {
    return (
      <button type="button" className="btn-ghost" onClick={() => setConfirm(true)}>
        Cancel order
      </button>
    );
  }
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-ink-soft">Sure?</span>
      <button
        type="button"
        className="btn-secondary"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const r = await cancelMyOrder(orderId);
            if (r.ok) router.refresh();
            else setError(r.error ?? "Could not cancel.");
          })
        }
      >
        {pending ? "Cancelling…" : "Yes, cancel"}
      </button>
      <button type="button" className="btn-ghost" onClick={() => setConfirm(false)}>
        Keep it
      </button>
      {error && <span className="text-tomato-deep">{error}</span>}
    </div>
  );
}
