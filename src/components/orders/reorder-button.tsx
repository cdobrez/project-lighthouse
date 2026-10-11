"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/components/cart/cart-provider";

type Line = { mealId: string; slug: string; title: string; unitCents: number; qty: number; imageKey: string; cuisine: string; fulfillment: string[]; readyWindow: string; available: boolean };

export function ReorderButton({ lines, cook }: { lines: Line[]; cook: { id: string; name: string; slug: string } }) {
  const { add, clear } = useCart();
  const router = useRouter();
  const [msg, setMsg] = useState("");
  const usable = lines.filter((l) => l.available);
  if (!usable.length) return null;
  return (
    <div>
      <button
        type="button"
        className="btn-secondary"
        onClick={() => {
          clear();
          for (const l of usable) {
            add({ mealId: l.mealId, slug: l.slug, title: l.title, unitCents: l.unitCents, cookId: cook.id, cookName: cook.name, cookSlug: cook.slug, imageKey: l.imageKey, cuisine: l.cuisine, fulfillment: l.fulfillment, readyWindow: l.readyWindow }, l.qty);
          }
          setMsg(usable.length < lines.length ? "Some items aren't on the menu right now; the rest are in your basket." : "");
          router.push("/cart");
        }}
      >
        🔁 Order this again
      </button>
      {msg && <p className="mt-1 text-xs text-ink-muted">{msg}</p>}
    </div>
  );
}
