"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition } from "react";
import { NEIGHBORHOODS } from "@/lib/neighborhoods";
import { DAY_ORDER, FULFILLMENT_LABELS } from "@/lib/format";

const DIETS = ["vegetarian", "vegan", "gluten-free", "dairy-free", "nut-free"];
const SORTS: { value: string; label: string }[] = [
  { value: "popular", label: "Most ordered" },
  { value: "rating", label: "Top rated" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
];

export function MealFilters({ cuisines, total }: { cuisines: string[]; total: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  function set(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    startTransition(() => router.replace(`${pathname}?${next.toString()}`, { scroll: false }));
  }

  const q = params.get("q") ?? "";
  const active = ["cuisine", "diet", "fulfillment", "neighborhood", "day"].filter((k) => params.get(k)).length;

  return (
    <div className="card sticky top-20 p-4" aria-busy={pending}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const value = (new FormData(e.currentTarget).get("q") as string) ?? "";
          set("q", value.trim());
        }}
        className="flex gap-2"
      >
        <label className="sr-only" htmlFor="meal-search">
          Search meals
        </label>
        <input id="meal-search" name="q" defaultValue={q} placeholder="Search lasagna, pho, Rosa…" className="input" />
        <button type="submit" className="btn-secondary px-3" aria-label="Search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
          </svg>
        </button>
      </form>

      <Field label="Neighborhood">
        <select className="input" value={params.get("neighborhood") ?? ""} onChange={(e) => set("neighborhood", e.target.value)}>
          <option value="">Anywhere nearby</option>
          {NEIGHBORHOODS.map((n) => (
            <option key={n.name} value={n.name}>
              {n.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Available">
        <div className="flex flex-wrap gap-1.5">
          <Toggle active={!params.get("day")} onClick={() => set("day", "")}>
            Any day
          </Toggle>
          {DAY_ORDER.map((d) => (
            <Toggle key={d} active={params.get("day") === d} onClick={() => set("day", d)}>
              {d}
            </Toggle>
          ))}
        </div>
      </Field>

      <Field label="Hand-off">
        <div className="flex flex-wrap gap-1.5">
          <Toggle active={!params.get("fulfillment")} onClick={() => set("fulfillment", "")}>
            Any
          </Toggle>
          {Object.entries(FULFILLMENT_LABELS).map(([k, v]) => (
            <Toggle key={k} active={params.get("fulfillment") === k} onClick={() => set("fulfillment", k)}>
              {v.short}
            </Toggle>
          ))}
        </div>
      </Field>

      <Field label="Cuisine">
        <select className="input" value={params.get("cuisine") ?? ""} onChange={(e) => set("cuisine", e.target.value)}>
          <option value="">All cuisines</option>
          {cuisines.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Diet">
        <div className="flex flex-wrap gap-1.5">
          {DIETS.map((d) => (
            <Toggle key={d} active={params.get("diet") === d} onClick={() => set("diet", params.get("diet") === d ? "" : d)}>
              {d}
            </Toggle>
          ))}
        </div>
      </Field>

      <Field label="Sort">
        <select className="input" value={params.get("sort") ?? "popular"} onChange={(e) => set("sort", e.target.value)}>
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </Field>

      <div className="mt-4 flex items-center justify-between text-xs text-ink-muted">
        <span>
          {total} {total === 1 ? "meal" : "meals"}
        </span>
        {(active > 0 || q) && (
          <button type="button" className="font-bold text-tomato hover:underline" onClick={() => startTransition(() => router.replace(pathname))}>
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <p className="label">{label}</p>
      {children}
    </div>
  );
}

function Toggle({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full px-3 py-1 text-xs font-bold transition-colors ${active ? "bg-ink text-cream" : "bg-cream-deep text-ink-soft hover:bg-line"}`}
    >
      {children}
    </button>
  );
}
