"use client";

import { useRouter } from "next/navigation";
import { useOptimistic, useTransition } from "react";
import { likePost } from "@/lib/actions/community";

export function LikeButton({ postId, likes, canLike }: { postId: string; likes: number; canLike: boolean }) {
  const [optimistic, bump] = useOptimistic(likes, (n: number) => n + 1);
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold text-ink-soft hover:bg-cream-deep disabled:opacity-60"
      disabled={pending || !canLike}
      title={canLike ? "Give this a warm reaction" : "Sign in to react"}
      onClick={() =>
        start(async () => {
          bump(null);
          await likePost(postId);
          router.refresh();
        })
      }
    >
      <span aria-hidden>🧡</span> {optimistic}
    </button>
  );
}
