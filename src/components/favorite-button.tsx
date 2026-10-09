"use client";

import { useOptimistic, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toggleFavorite } from "@/lib/actions/reviews";

export function FavoriteButton({ mealId, initial, signedIn }: { mealId: string; initial: boolean; signedIn: boolean }) {
  const [fav, setFav] = useOptimistic(initial);
  const [pending, start] = useTransition();
  const router = useRouter();
  const pathname = usePathname();
  return (
    <button
      type="button"
      disabled={pending}
      aria-pressed={fav}
      title={signedIn ? (fav ? "Remove from saved meals" : "Save for later") : "Sign in to save meals"}
      onClick={() =>
        start(async () => {
          if (!signedIn) {
            router.push(`/login?next=${encodeURIComponent(pathname)}`);
            return;
          }
          setFav(!fav);
          const r = await toggleFavorite(mealId);
          if ("error" in r) console.warn(r.error);
        })
      }
      className={`btn-secondary px-3.5 ${fav ? "!bg-tomato-soft !text-tomato-deep" : ""}`}
    >
      <span aria-hidden>{fav ? "♥" : "♡"}</span>
      <span className="hidden sm:inline">{fav ? "Saved" : "Save"}</span>
    </button>
  );
}
