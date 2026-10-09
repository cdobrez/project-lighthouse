"use client";

import { useActionState, useState } from "react";
import { addReview } from "@/lib/actions/reviews";

export function ReviewForm({ mealId, orderId, existing }: { mealId: string; orderId?: string; existing?: { rating: number; comment: string } | null }) {
  const [state, action, pending] = useActionState(addReview, undefined);
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [hover, setHover] = useState(0);

  if (state?.ok) {
    return <div className="rounded-2xl bg-sage-soft p-4 text-sm font-semibold text-sage">Thanks for rating. Your neighbors (and the cook) appreciate it.</div>;
  }

  return (
    <form action={action} className="card p-5">
      <input type="hidden" name="mealId" value={mealId} />
      {orderId && <input type="hidden" name="orderId" value={orderId} />}
      <input type="hidden" name="rating" value={rating} />
      <p className="font-bold">{existing ? "Update your rating" : "Rate this recipe"}</p>
      <div className="mt-2 flex items-center gap-1" role="radiogroup" aria-label="Star rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={rating === n}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setRating(n)}
            className="text-3xl leading-none transition-transform hover:scale-110"
          >
            <span className={(hover || rating) >= n ? "text-[#e9a33b]" : "text-line"}>★</span>
          </button>
        ))}
        <span className="ml-2 text-sm text-ink-muted">{["", "Not for me", "It was okay", "Good", "Really good", "Would order every week"][hover || rating]}</span>
      </div>
      <textarea name="comment" rows={3} className="input mt-3" placeholder="What did your table think?" defaultValue={existing?.comment ?? ""} maxLength={600} />
      {state?.error && <p className="mt-2 text-sm font-semibold text-tomato-deep">{state.error}</p>}
      <button type="submit" className="btn-primary mt-3" disabled={pending || rating === 0}>
        {pending ? "Saving…" : "Post rating"}
      </button>
    </form>
  );
}
