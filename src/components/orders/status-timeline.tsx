import { ORDER_FLOW, STATUS_LABELS } from "@/lib/order-status";

export function StatusTimeline({ fulfillment, status }: { fulfillment: string; status: string }) {
  const flow = ORDER_FLOW[fulfillment] ?? ORDER_FLOW.pickup;
  if (status === "cancelled") {
    return <p className="rounded-xl bg-cream-deep p-3 text-sm font-semibold text-ink-soft">This order was cancelled.</p>;
  }
  const idx = flow.indexOf(status);
  return (
    <ol className="grid gap-2 sm:grid-cols-5" aria-label="Order progress">
      {flow.map((s, i) => {
        const done = i <= idx;
        const current = i === idx;
        return (
          <li key={s} className="flex items-center gap-2 sm:flex-col sm:items-start">
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-extrabold ${done ? "bg-sage text-white" : "bg-cream-deep text-ink-muted"} ${current ? "ring-4 ring-sage-soft" : ""}`}
              aria-hidden
            >
              {done ? "✓" : i + 1}
            </span>
            <span className={`text-xs font-bold ${done ? "text-ink" : "text-ink-muted"}`}>
              {STATUS_LABELS[s]}
              {current && <span className="sr-only"> (current)</span>}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
