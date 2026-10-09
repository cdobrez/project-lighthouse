"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toggleMealStatus } from "@/lib/actions/cook";

export function MealStatusToggle({ mealId, status }: { mealId: string; status: string }) {
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <button
      type="button"
      className="btn-ghost"
      disabled={pending}
      onClick={() =>
        start(async () => {
          await toggleMealStatus(mealId);
          router.refresh();
        })
      }
    >
      {pending ? "…" : status === "active" ? "Pause" : "Resume"}
    </button>
  );
}
