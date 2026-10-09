import Link from "next/link";
import { Photo } from "@/components/photo";
import { NEIGHBORHOODS } from "@/lib/neighborhoods";

export function Hero({ stats }: { stats: { cooks: number; meals: number; served: number } }) {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-12 pt-10 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:pb-20 lg:pt-16">
        <div className="fade-up">
          <p className="eyebrow mb-4">Home-cooked meals from your neighbors</p>
          <h1 className="text-[2.6rem] font-bold leading-[1.05] tracking-tight sm:text-6xl">
            Dinner tonight, <span className="text-tomato">cooked a few doors down.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-soft">
            Real home cooking from vetted neighbors who love to feed people. Pick it up on their porch, have it dropped at your door, or get it
            delivered hot. You get a real meal and a clean kitchen. They get a little extra income doing what they already love.
          </p>

          <form action="/meals" method="get" className="mt-7 flex max-w-xl flex-col gap-2 sm:flex-row">
            <label className="sr-only" htmlFor="hero-neighborhood">
              Your neighborhood
            </label>
            <select id="hero-neighborhood" name="neighborhood" className="input flex-1 py-3 text-base" defaultValue="">
              <option value="">All neighborhoods</option>
              {NEIGHBORHOODS.map((n) => (
                <option key={n.name} value={n.name}>
                  {n.name} ({n.zip})
                </option>
              ))}
            </select>
            <button type="submit" className="btn-primary py-3 text-base sm:px-7">
              See tonight&apos;s meals
            </button>
          </form>

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink-soft">
            <Stat value={stats.cooks} label="neighborhood cooks" />
            <Stat value={stats.meals} label="meals this week" />
            <Stat value={stats.served} label="dinners served" />
          </div>
          <p className="mt-4 text-sm text-ink-muted">
            Cooking for your neighbors?{" "}
            <Link href="/become-a-cook" className="font-bold text-tomato hover:underline">
              Open your kitchen →
            </Link>
          </p>
        </div>

        <div className="relative">
          <div className="relative aspect-[16/11] overflow-hidden rounded-[2rem] shadow-[0_30px_60px_-30px_rgb(43_33_24/0.45)] ring-1 ring-line">
            <Photo imageKey="hero-front-door" priority sizes="(max-width: 1024px) 100vw, 50vw" />
          </div>
          <figure className="card absolute -bottom-5 left-4 flex max-w-[280px] items-center gap-3 p-3 sm:-left-6">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-tomato-soft text-xl" aria-hidden>
              🥘
            </span>
            <figcaption className="text-sm leading-snug">
              <span className="font-bold">Rosa&apos;s lasagna</span> just landed on a porch in Maple Grove.
              <span className="block text-xs text-ink-muted">Still bubbling. Dish goes back next week.</span>
            </figcaption>
          </figure>
          <div className="absolute -right-3 -top-4 rotate-6 rounded-2xl bg-butter px-4 py-2 font-display text-sm font-bold text-ink shadow-md sm:-right-5">
            Made with love, not a microwave
          </div>
        </div>
      </div>
      <div className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full bg-tomato-soft/60 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-butter-soft blur-3xl" aria-hidden />
    </section>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <span>
      <span className="font-display text-xl font-bold text-ink">{value.toLocaleString()}</span> {label}
    </span>
  );
}
