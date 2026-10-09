"use client";

import { useActionState } from "react";
import { replyToPost } from "@/lib/actions/community";

export function ReplyForm({ postId }: { postId: string }) {
  const [state, action, pending] = useActionState(replyToPost, undefined);
  return (
    <form action={action} className="flex gap-2">
      <input type="hidden" name="postId" value={postId} />
      <input name="body" className="input" placeholder="Write a reply…" required maxLength={1000} key={state?.ok ? "reset" : "idle"} />
      <button type="submit" className="btn-primary shrink-0" disabled={pending}>
        {pending ? "…" : "Reply"}
      </button>
      {state?.error && <p className="text-sm text-tomato-deep">{state.error}</p>}
    </form>
  );
}
