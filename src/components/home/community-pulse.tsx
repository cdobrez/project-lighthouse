import Link from "next/link";
import { Section, SectionHeading } from "@/components/section";
import { Avatar } from "@/components/avatar";
import { RatingStars } from "@/components/rating-stars";
import { timeAgo } from "@/lib/format";
import type { recentReviews, PostWithAuthor } from "@/lib/queries";

type Review = Awaited<ReturnType<typeof recentReviews>>[number];

const KIND_LABEL: Record<string, string> = { post: "Story", recipe: "Recipe tip", event: "Event", request: "Looking for" };

export function CommunityPulse({ reviews, posts }: { reviews: Review[]; posts: PostWithAuthor[] }) {
  return (
    <Section className="py-16">
      <SectionHeading
        eyebrow="The neighborhood"
        title="What people are saying over the fence"
        blurb="Ratings keep the food honest. The community board keeps the neighborhood talking: potlucks, recipe tips, and requests for the dish you've been missing."
        action={
          <Link href="/community" className="btn-secondary">
            Visit the community board
          </Link>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="grid gap-4 sm:grid-cols-2">
          {reviews.map((r) => (
            <blockquote key={r.id} className="card flex flex-col p-5">
              <RatingStars value={r.rating} showValue={false} />
              <p className="mt-3 flex-1 text-sm leading-relaxed text-ink">“{r.comment}”</p>
              <footer className="mt-4 flex items-center gap-2.5 text-xs text-ink-muted">
                <Avatar name={r.user.name} hue={r.user.avatarHue} size={28} />
                <span>
                  <span className="font-bold text-ink">{r.user.name}</span> on{" "}
                  {r.mealSlug ? (
                    <Link href={`/meals/${r.mealSlug}`} className="font-semibold text-tomato hover:underline">
                      {r.mealTitle}
                    </Link>
                  ) : (
                    r.cookName
                  )}
                </span>
              </footer>
            </blockquote>
          ))}
        </div>
        <div className="card divide-y divide-line">
          {posts.map((p) => (
            <Link key={p.id} href={`/community/${p.id}`} className="flex gap-3 p-4 transition-colors hover:bg-cream-deep/60">
              <Avatar name={p.author.name} hue={p.author.avatarHue} size={36} />
              <div className="min-w-0">
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-tomato">
                  {KIND_LABEL[p.kind] ?? p.kind} · {p.neighborhood}
                </p>
                <p className="truncate font-bold">{p.title}</p>
                <p className="line-clamp-2 text-sm text-ink-soft">{p.body}</p>
                <p className="mt-1 text-xs text-ink-muted">
                  {p.author.name} · {timeAgo(p.createdAt)} · {p.replyCount} replies
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </Section>
  );
}
