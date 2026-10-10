import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPost } from "@/lib/queries";
import { getCurrentUser } from "@/lib/auth";
import { Section } from "@/components/section";
import { Avatar } from "@/components/avatar";
import { ReplyForm } from "@/components/community/reply-form";
import { LikeButton } from "@/components/community/like-button";
import { timeAgo } from "@/lib/format";

export const dynamic = "force-dynamic";

const KIND_LABEL: Record<string, string> = { post: "Story", recipe: "Recipe tip", event: "Event", request: "Looking for" };

export async function generateMetadata(props: PageProps<"/community/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  const post = await getPost(id);
  return { title: post?.title ?? "Post" };
}

export default async function PostPage(props: PageProps<"/community/[id]">) {
  const { id } = await props.params;
  const post = await getPost(id);
  if (!post) notFound();
  const user = await getCurrentUser();
  return (
    <Section className="max-w-3xl py-10">
      <nav className="mb-4 text-sm text-ink-muted" aria-label="Breadcrumb">
        <Link href="/community" className="hover:text-tomato">
          Community board
        </Link>{" "}
        / {KIND_LABEL[post.kind]}
      </nav>
      <article className="card p-6">
        <p className="text-[11px] font-extrabold uppercase tracking-wider text-tomato">
          {KIND_LABEL[post.kind]} · {post.neighborhood}
        </p>
        <h1 className="mt-1 text-3xl font-bold leading-tight tracking-tight">{post.title}</h1>
        {post.eventAt && <p className="mt-2 inline-block rounded-full bg-butter-soft px-3 py-1 text-sm font-bold">📅 {post.eventAt}</p>}
        <p className="mt-4 whitespace-pre-line text-base leading-relaxed text-ink">{post.body}</p>
        <footer className="mt-5 flex flex-wrap items-center gap-3 text-sm text-ink-muted">
          <Avatar name={post.author.name} hue={post.author.avatarHue} size={32} />
          <span>
            <span className="font-bold text-ink">{post.author.name}</span> · {post.author.neighborhood} · {timeAgo(post.createdAt)}
          </span>
          <LikeButton postId={post.id} likes={post.likes} canLike={Boolean(user)} />
        </footer>
      </article>

      <h2 className="mt-8 text-xl font-bold">
        {post.replies.length} {post.replies.length === 1 ? "reply" : "replies"}
      </h2>
      <ul className="mt-3 space-y-3">
        {post.replies.map((r) => (
          <li key={r.id} className="flex gap-3">
            <Avatar name={r.author.name} hue={r.author.avatarHue} size={32} />
            <div className="card flex-1 p-3">
              <p className="text-xs text-ink-muted">
                <span className="font-bold text-ink">{r.author.name}</span> · {timeAgo(r.createdAt)}
              </p>
              <p className="mt-1 text-sm leading-relaxed">{r.body}</p>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-5">
        {user ? (
          <ReplyForm postId={post.id} />
        ) : (
          <p className="text-sm text-ink-soft">
            <Link href={`/login?next=/community/${post.id}`} className="font-bold text-tomato hover:underline">
              Sign in
            </Link>{" "}
            to reply.
          </p>
        )}
      </div>
    </Section>
  );
}
