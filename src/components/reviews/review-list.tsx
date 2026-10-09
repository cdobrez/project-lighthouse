import { Avatar } from "@/components/avatar";
import { RatingStars } from "@/components/rating-stars";
import { timeAgo } from "@/lib/format";
import type { ReviewWithUser } from "@/lib/queries";

export function ReviewList({ reviews, showMeal = false }: { reviews: ReviewWithUser[]; showMeal?: boolean }) {
  if (!reviews.length) {
    return <p className="text-sm text-ink-muted">No ratings yet. Be the first neighbor to try it.</p>;
  }
  return (
    <ul className="space-y-4">
      {reviews.map((r) => (
        <li key={r.id} className="flex gap-3">
          <Avatar name={r.user.name} hue={r.user.avatarHue} size={36} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="font-bold">{r.user.name}</span>
              <span className="text-xs text-ink-muted">
                {r.user.neighborhood} · {timeAgo(r.createdAt)}
              </span>
            </div>
            <RatingStars value={r.rating} showValue={false} className="mt-0.5" />
            {showMeal && r.mealTitle && <p className="text-xs font-semibold text-ink-muted">on {r.mealTitle}</p>}
            {r.comment && <p className="mt-1 text-sm leading-relaxed text-ink">{r.comment}</p>}
          </div>
        </li>
      ))}
    </ul>
  );
}
