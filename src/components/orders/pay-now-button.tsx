"use client";

import { useState, useTransition } from "react";
import { resumePayment } from "@/lib/actions/orders";

export function PayNowButton({ orderId }: { orderId: string }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  return (
    <div>
      <button
        type="button"
        className="btn-primary"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const r = await resumePayment(orderId);
            if (r.ok) window.location.assign(r.checkoutUrl);
            else setError(r.error);
          })
        }
      >
        {pending ? "Opening payment…" : "Pay now"}
      </button>
      {error && <p className="mt-2 text-sm font-semibold text-tomato-deep">{error}</p>}
    </div>
  );
}
