import type { Metadata } from "next";
import Link from "next/link";
import { listCooks } from "@/lib/queries";
import { CookCard } from "@/components/cook-card";
import { Section } from "@/components/section";
import { NEIGHBORHOODS } from "@/lib/neighborhoods";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Meet the cooks", description: "Vetted home cooks in your neighborhood, rated by the people who eat their food." };

export default async function CooksPage(props: PageProps<"/cooks">) {
  const sp = await props.searchParams;
  const neighborhood = typeof sp.neighborhood === "string" ? sp.neighborhood : undefined;
  const cooks = await listCooks(neighborhood);
  return (
    <Section className="py-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow mb-2">Meet the cooks</p>
          <h1 className="text-4xl font-bold tracking-tight">The neighbors behind the meals</h1>
          <p className="mt-2 max-w-2xl text-ink-soft">
            Every cook on Gig Kitchens is food-handler certified and has had their kitchen reviewed. Ratings come only from neighbors who ordered.
          </p>
        </div>
        <Link href="/become-a-cook" className="btn-primary">
          Become a cook
        </Link>
      </div>
      <div className="mb-6 flex flex-wrap gap-2">
        <Link href="/cooks" className={`rounded-full px-3.5 py-1.5 text-sm font-bold ${!neighborhood ? "bg-ink text-cream" : "bg-cream-deep text-ink-soft hover:bg-line"}`}>
          All neighborhoods
        </Link>
        {NEIGHBORHOODS.map((n) => (
          <Link
            key={n.name}
            href={`/cooks?neighborhood=${encodeURIComponent(n.name)}`}
            className={`rounded-full px-3.5 py-1.5 text-sm font-bold ${neighborhood === n.name ? "bg-ink text-cream" : "bg-cream-deep text-ink-soft hover:bg-line"}`}
          >
            {n.name}
          </Link>
        ))}
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        {cooks.map((c) => (
          <CookCard key={c.id} cook={c} mealCount={c.mealCount} />
        ))}
      </div>
      {cooks.length === 0 && <p className="card p-8 text-center text-ink-soft">No cooks in that neighborhood yet. Know someone who should be? Send them our way.</p>}
    </Section>
  );
}
