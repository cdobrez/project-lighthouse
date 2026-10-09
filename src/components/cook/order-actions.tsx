"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { advanceOrder } from "@/lib/actions/orders";
import { nextStatus, STATUS_LABELS } from "@/lib/order-status";

export function OrderActions({ orderId, fulfillment, status }: { orderId: string; fulfillment: string; status: string }) {
  const [pending, start] = useTransition();
  const router = useRouter();
  const next = nextStatus(fulfillment, status);
  if (status === "cancelled" || !next) return null;
  const go = (s: string) =>
    start(async () => {
      await advanceOrder(orderId, s);
      router.refresh();
    });
  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" className="btn-primary" disabled={pending} onClick={() => go(next)}>
        {pending ? "Updating…" : `Mark: ${STATUS_LABELS[next]}`}
      </button>
      {status === "placed" && (
        <button type="button" className="btn-ghost" disabled={pending} onClick={() => go("cancelled")}>
          Decline
        </button>
      )}
    </div>
  );
}
