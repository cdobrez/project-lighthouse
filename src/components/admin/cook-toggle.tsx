"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setCookActive } from "@/lib/actions/admin";

export function CookToggle({ cookId, active }: { cookId: string; active: boolean }) {
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <button
      type="button"
      className={`px-3 py-1 text-xs ${active ? "btn-ghost" : "btn-secondary"}`}
      disabled={pending}
      onClick={() =>
        start(async () => {
          await setCookActive(cookId, !active);
          router.refresh();
        })
      }
    >
      {active ? "Pause kitchen" : "Reactivate"}
    </button>
  );
}
