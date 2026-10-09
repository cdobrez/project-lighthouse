import type { Metadata } from "next";
import Link from "next/link";
import { listPosts } from "@/lib/queries";
import { getCurrentUser } from "@/lib/auth";
import { Section } from "@/components/section";
import { Avatar } from "@/components/avatar";
import { Photo } from "@/components/photo";
import { PostForm } from "@/components/community/post-form";
import { LikeButton } from "@/components/community/like-button";
import { NEIGHBORHOODS } from "@/lib/neighborhoods";
import { timeAgo } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Community board", description: "Stories, recipe tips, requests and events from your neighborhood." };

const KIND_LABEL: Record<string, string> = { post: "Story", recipe: "Recipe tip", event: "Event", request: "Looking for" };

export default async function CommunityPage(props: PageProps<"/community">) {
  const sp = await props.searchParams;
  const neighborhood = typeof sp.neighborhood === "string" ? sp.neighborhood : undefined;
  const kind = typeof sp.kind === "string" ? sp.kind : undefined;
  const [user, posts] = [await getCurrentUser(), listPosts(neighborhood, kind && kind in KIND_LABEL ? kind : undefined)];

  return (
    <>
      <div className="relative overflow-hidden bg-cream-deep/50">
        <Section className="grid items-center gap-8 py-12 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <p className="eyebrow mb-3">Community board</p>
            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">Over the fence</h1>
            <p className="mt-3 max-w-xl text-lg text-ink-soft">
              Thank a cook, ask for the dish you miss, share a kitchen trick, or get a potluck going. This is the part that makes a street a neighborhood.
            </p>
          </div>
          <div className="relative aspect-[16/10] overflow-hidden rounded-[2rem] ring-1 ring-line">
            <Photo imageKey="scene-potluck" priority sizes="(max-width: 1024px) 100vw, 50vw" />
          </div>
        </Section>
      </div>

      <Section className="py-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div>
            <div className="mb-5 flex flex-wrap gap-2">
              <FilterLink href="/community" active={!neighborhood && !kind}>
                Everything
              </FilterLink>
              {NEIGHBORHOODS.map((n) => (
                <FilterLink key={n.name} href={`/community?neighborhood=${encodeURIComponent(n.name)}`} active={neighborhood === n.name}>
                  {n.name}
                </FilterLink>
              ))}
              <span className="mx-1 self-center text-line">|</span>
              {Object.entries(KIND_LABEL).map(([k, label]) => (
                <FilterLink key={k} href={`/community?kind=${k}`} active={kind === k}>
                  {label}
                </FilterLink>
              ))}
            </div>
            {posts.length === 0 ? (
              <p className="card p-8 text-center text-ink-soft">Quiet over here. Be the first to post.</p>
            ) : (
              <ul className="space-y-3">
                {posts.map((p) => (
                  <li key={p.id} className="card p-5">
                    <div className="flex items-start gap-3">
                      <Avatar name={p.author.name} hue={p.author.avatarHue} size={40} />
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-extrabold uppercase tracking-wider text-tomato">
                          {KIND_LABEL[p.kind]} · {p.neighborhood}
                          {p.eventAt && <span className="ml-2 rounded-full bg-butter-soft px-2 py-0.5 normal-case tracking-normal text-ink">📅 {p.eventAt}</span>}
                        </p>
                        <h2 className="mt-0.5 text-lg font-bold leading-snug">
                          <Link href={`/community/${p.id}`} className="hover:text-tomato">
                            {p.title}
                          </Link>
                        </h2>
                        <p className="mt-1 text-sm leading-relaxed text-ink-soft">{p.body}</p>
                        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-ink-muted">
                          <span>
                            <span className="font-bold text-ink">{p.author.name}</span> · {timeAgo(p.createdAt)}
                          </span>
                          <LikeButton postId={p.id} likes={p.likes} canLike={Boolean(user)} />
                          <Link href={`/community/${p.id}`} className="font-bold hover:text-tomato">
                            {p.replyCount} {p.replyCount === 1 ? "reply" : "replies"}
                          </Link>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <aside className="space-y-4">
            {user ? (
              <PostForm neighborhood={user.neighborhood || "Maple Grove"} initialKind={kind ?? "post"} />
            ) : (
              <div className="card p-5 text-sm">
                <p className="font-bold">Join the conversation</p>
                <p className="mt-1 text-ink-soft">Sign in to post, reply, and react.</p>
                <Link href="/login?next=/community" className="btn-primary mt-3">
                  Sign in
                </Link>
              </div>
            )}
            <div className="card p-5 text-sm">
              <p className="font-bold">House rules</p>
              <ul className="mt-2 space-y-1 text-ink-soft">
                <li>• Be the neighbor you&apos;d want next door.</li>
                <li>• Rate the food, not the person.</li>
                <li>• Return the dish.</li>
              </ul>
            </div>
          </aside>
        </div>
      </Section>
    </>
  );
}

function FilterLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link href={href} className={`rounded-full px-3.5 py-1.5 text-sm font-bold ${active ? "bg-ink text-cream" : "bg-cream-deep text-ink-soft hover:bg-line"}`}>
      {children}
    </Link>
  );
}
