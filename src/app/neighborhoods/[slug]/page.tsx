import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Section, SectionHeading } from "@/components/section";
import { MealCard } from "@/components/meal-card";
import { CookCard } from "@/components/cook-card";
import { Avatar } from "@/components/avatar";
import { Photo } from "@/components/photo";
import { NEIGHBORHOODS } from "@/lib/neighborhoods";
import { listCooks, listMeals, listPosts } from "@/lib/queries";
import { slugify } from "@/lib/ids";
import { timeAgo } from "@/lib/format";

export const dynamic = "force-dynamic";

const PHOTOS = ["scene-potluck", "scene-pickup", "scene-family-table"];

function find(slug: string) {
  return NEIGHBORHOODS.find((n) => slugify(n.name) === slug) ?? null;
}

export async function generateMetadata(props: PageProps<"/neighborhoods/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const n = find(slug);
  return n ? { title: `${n.name} neighborhood`, description: `Home cooks, tonight's meals and the community board in ${n.name}.` } : { title: "Neighborhood" };
}

export default async function NeighborhoodPage(props: PageProps<"/neighborhoods/[slug]">) {
  const { slug } = await props.params;
  const n = find(slug);
  if (!n) notFound();
  const idx = NEIGHBORHOODS.indexOf(n);
  const cooks = await listCooks(n.name);
  const meals = await listMeals({ neighborhood: n.name, sort: "popular" });
  const posts = (await listPosts(n.name)).slice(0, 5);

  return (
    <>
      <div className="bg-cream-deep/50">
        <Section className="grid items-center gap-8 py-12 lg:grid-cols-[1fr_1fr]">
          <div>
            <p className="eyebrow mb-2">
              <Link href="/neighborhoods" className="hover:underline">
                Neighborhoods
              </Link>{" "}
              · {n.zip}
            </p>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{n.name}</h1>
            <p className="mt-3 text-lg text-ink-soft">{n.blurb}</p>
            <p className="mt-4 font-bold">
              {cooks.length} cooks · {meals.length} meals this week · {posts.length} recent posts
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link href={`/meals?neighborhood=${encodeURIComponent(n.name)}`} className="btn-primary">
                Tonight&apos;s meals
              </Link>
              <Link href={`/community?neighborhood=${encodeURIComponent(n.name)}`} className="btn-secondary">
                Community board
              </Link>
            </div>
          </div>
          <div className="relative aspect-[16/10] overflow-hidden rounded-[2rem] ring-1 ring-line">
            <Photo imageKey={PHOTOS[idx % PHOTOS.length]} priority sizes="(max-width: 1024px) 100vw, 50vw" />
          </div>
        </Section>
      </div>

      <Section className="py-10">
        <SectionHeading eyebrow="Cooks" title={`Cooking in ${n.name}`} />
        {cooks.length ? (
          <div className="grid gap-5 md:grid-cols-2">
            {cooks.map((c) => (
              <CookCard key={c.id} cook={c} mealCount={c.mealCount} />
            ))}
          </div>
        ) : (
          <p className="card p-6 text-ink-soft">No cooks here yet. Be the first.</p>
        )}
      </Section>

      <Section className="py-6">
        <SectionHeading eyebrow="This week" title="On the menu nearby" action={<Link href={`/meals?neighborhood=${encodeURIComponent(n.name)}`} className="btn-secondary">All meals</Link>} />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {meals.slice(0, 6).map((m) => (
            <MealCard key={m.id} meal={m} />
          ))}
        </div>
      </Section>

      <Section className="py-10">
        <SectionHeading eyebrow="Over the fence" title="Latest from the board" action={<Link href={`/community?neighborhood=${encodeURIComponent(n.name)}`} className="btn-secondary">Visit the board</Link>} />
        <ul className="card divide-y divide-line">
          {posts.map((p) => (
            <li key={p.id}>
              <Link href={`/community/${p.id}`} className="flex gap-3 p-4 hover:bg-cream-deep/50">
                <Avatar name={p.author.name} hue={p.author.avatarHue} size={36} />
                <span className="min-w-0">
                  <span className="block font-bold">{p.title}</span>
                  <span className="block truncate text-sm text-ink-soft">{p.body}</span>
                  <span className="text-xs text-ink-muted">
                    {p.author.name} · {timeAgo(p.createdAt)}
                  </span>
                </span>
              </Link>
            </li>
          ))}
          {posts.length === 0 && <li className="p-4 text-sm text-ink-soft">Quiet so far. Start the conversation.</li>}
        </ul>
      </Section>
    </>
  );
}
