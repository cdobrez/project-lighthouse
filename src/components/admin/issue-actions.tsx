"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { resolveIssue } from "@/lib/actions/admin";

export function IssueActions({ issueId }: { issueId: string }) {
  const [pending, start] = useTransition();
  const router = useRouter();
  const go = (s: "refunded" | "resolved") =>
    start(async () => {
      await resolveIssue(issueId, s);
      router.refresh();
    });
  return (
    <span className="flex gap-1">
      <button type="button" className="btn-secondary px-3 py-1 text-xs" disabled={pending} onClick={() => go("refunded")}>
        Refund
      </button>
      <button type="button" className="btn-ghost px-3 py-1 text-xs" disabled={pending} onClick={() => go("resolved")}>
        Resolve
      </button>
    </span>
  );
}
