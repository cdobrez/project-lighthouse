"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "./logo";
import { Avatar } from "./avatar";
import { useCart } from "./cart/cart-provider";

type Props = {
  user: { name: string; neighborhood: string; avatarHue: number } | null;
  isCook: boolean;
};

const NAV = [
  { href: "/meals", label: "Tonight's meals" },
  { href: "/cooks", label: "Cooks" },
  { href: "/community", label: "Community" },
  { href: "/how-it-works", label: "How it works" },
];

export function SiteHeader({ user, isCook }: Props) {
  const pathname = usePathname();
  const { count, hydrated } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-cream/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-4 sm:gap-4 sm:px-6">
        <Logo />
        <nav className="ml-6 hidden items-center gap-1 md:flex" aria-label="Primary">
          {NAV.map((n) => {
            const active = pathname === n.href || pathname.startsWith(n.href + "/");
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`rounded-full px-3.5 py-2 text-sm font-bold transition-colors ${active ? "bg-cream-deep text-ink" : "text-ink-soft hover:bg-cream-deep hover:text-ink"}`}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          {isCook ? (
            <Link href="/cook" className="btn-ghost hidden sm:inline-flex">
              My kitchen
            </Link>
          ) : (
            <Link href="/become-a-cook" className="btn-ghost hidden sm:inline-flex">
              Cook with us
            </Link>
          )}
          <Link href="/cart" className="btn-secondary relative px-2.5 sm:px-5" aria-label={`Basket, ${count} items`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M3 7h18l-1.5 11a2 2 0 0 1-2 1.7h-11a2 2 0 0 1-2-1.7z" />
              <path d="M8 7a4 4 0 0 1 8 0" />
            </svg>
            <span className="hidden sm:inline">Basket</span>
            {hydrated && count > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-tomato px-1 text-[11px] font-extrabold text-white ring-2 ring-cream">
                {count}
              </span>
            )}
          </Link>
          {user ? (
            <Link href="/account" className="flex items-center gap-2 rounded-full py-1 pl-1 pr-3 ring-1 ring-line hover:bg-cream-deep">
              <Avatar name={user.name} hue={user.avatarHue} size={30} />
              <span className="hidden text-sm font-bold sm:inline">{user.name.split(" ")[0]}</span>
            </Link>
          ) : (
            <Link href="/login" className="btn-primary px-3.5 sm:px-5">
              Sign in
            </Link>
          )}
          <button
            className="btn-ghost px-2.5 md:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label="Toggle menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>
      {open && (
        <nav id="mobile-nav" className="border-t border-line bg-paper px-4 py-3 md:hidden" aria-label="Mobile">
          {[...NAV, isCook ? { href: "/cook", label: "My kitchen" } : { href: "/become-a-cook", label: "Cook with us" }].map((n) => (
            <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm font-bold text-ink hover:bg-cream-deep">
              {n.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
