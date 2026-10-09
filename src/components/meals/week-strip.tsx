import Link from "next/link";
import { DAY_ORDER, todayLabel } from "@/lib/format";

export function WeekStrip({ counts, active, baseParams }: { counts: Record<string, number>; active?: string; baseParams: string }) {
  const today = todayLabel();
  return (
    <div className="mb-6 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Cooking days">
      {DAY_ORDER.map((d) => {
        const sel = active === d;
        const params = new URLSearchParams(baseParams);
        if (sel) params.delete("day");
        else params.set("day", d);
        const qs = params.toString();
        return (
          <Link
            key={d}
            role="tab"
            aria-selected={sel}
            href={`/meals${qs ? `?${qs}` : ""}`}
            className={`flex min-w-[76px] flex-col items-center rounded-2xl px-3 py-2 ring-1 transition-colors ${sel ? "bg-ink text-cream ring-ink" : "bg-paper text-ink ring-line hover:bg-cream-deep"}`}
          >
            <span className="text-[11px] font-extrabold uppercase tracking-wider">{d === today ? "Tonight" : d}</span>
            <span className={`text-lg font-bold ${sel ? "text-cream" : "text-ink"}`}>{counts[d] ?? 0}</span>
            <span className={`text-[10px] ${sel ? "text-cream/80" : "text-ink-muted"}`}>meals</span>
          </Link>
        );
      })}
    </div>
  );
}
