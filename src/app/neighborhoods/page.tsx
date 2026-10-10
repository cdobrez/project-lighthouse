import type { Metadata } from "next";
import Link from "next/link";
import { Section, SectionHeading } from "@/components/section";
import { NEIGHBORHOODS } from "@/lib/neighborhoods";
import { listCooks, listMeals, listPosts } from "@/lib/queries";
import { slugify } from "@/lib/ids";
import { WaitlistForm } from "@/components/waitlist-form";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Neighborhoods", description: "The neighborhoods where Gig Kitchens cooks are serving tonight." };

export default async function NeighborhoodsPage() {
  const stats = await Promise.all(
    NEIGHBORHOODS.map(async (n) => ({
      n,
      cooks: (await listCooks(n.name)).length,
      meals: (await listMeals({ neighborhood: n.name })).length,
      posts: (await listPosts(n.name)).length,
    }))
  );
  return (
    <Section className="py-10">
      <SectionHeading eyebrow="Neighborhoods" title="Where we're cooking" blurb="Gig Kitchens grows one street at a time. Pick your neighborhood to see its cooks, tonight's meals, and the community board." />
      <div className="grid gap-5 md:grid-cols-3">
        {stats.map(({ n, cooks, meals, posts }) => {
          return (
            <Link key={n.name} href={`/neighborhoods/${slugify(n.name)}`} className="card p-6 transition-transform hover:-translate-y-0.5">
              <p className="eyebrow">{n.zip}</p>
              <h2 className="mt-1 text-2xl font-bold">{n.name}</h2>
              <p className="mt-2 text-sm text-ink-soft">{n.blurb}</p>
              <p className="mt-4 text-sm font-bold text-ink">
                {cooks} cooks · {meals} meals · {posts} posts
              </p>
            </Link>
          );
        })}
      </div>
      <div className="mt-10 max-w-xl">
        <WaitlistForm />
      </div>
    </Section>
  );
}
