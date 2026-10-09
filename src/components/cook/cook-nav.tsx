"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/cook", label: "Orders" },
  { href: "/cook/meals", label: "My meals" },
  { href: "/cook/profile", label: "Kitchen profile" },
];

export function CookNav() {
  const pathname = usePathname();
  return (
    <nav className="mt-5 flex gap-1 border-b border-line" aria-label="Cook dashboard">
      {TABS.map((t) => {
        const active = t.href === "/cook" ? pathname === "/cook" : pathname.startsWith(t.href);
        return (
          <Link key={t.href} href={t.href} className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-bold ${active ? "border-tomato text-ink" : "border-transparent text-ink-soft hover:text-ink"}`}>
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
