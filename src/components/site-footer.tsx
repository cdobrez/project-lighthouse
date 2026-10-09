import Link from "next/link";
import { Logo } from "./logo";

const COLS = [
  {
    title: "Eat",
    links: [
      { href: "/meals", label: "Tonight's meals" },
      { href: "/cooks", label: "Meet the cooks" },
      { href: "/how-it-works", label: "How it works" },
      { href: "/faq", label: "FAQ" },
    ],
  },
  {
    title: "Cook",
    links: [
      { href: "/become-a-cook", label: "Become a cook" },
      { href: "/safety", label: "Food safety & trust" },
      { href: "/cook", label: "Cook dashboard" },
    ],
  },
  {
    title: "Neighborhood",
    links: [
      { href: "/community", label: "Community board" },
      { href: "/neighborhoods", label: "Neighborhoods" },
      { href: "/about", label: "Our story" },
      { href: "/contact", label: "Contact" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-line bg-cream-deep/60">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-soft">
            Real dinners, cooked by real neighbors. Gig Kitchens connects busy households with home cooks a few streets away, so everyone eats
            better and the neighborhood gets a little closer.
          </p>
          <p className="mt-4 text-xs text-ink-muted">Made with love in kitchens like yours.</p>
        </div>
        {COLS.map((c) => (
          <div key={c.title}>
            <h3 className="font-sans text-xs font-extrabold uppercase tracking-[0.18em] text-ink-muted">{c.title}</h3>
            <ul className="mt-4 space-y-2.5">
              {c.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm font-semibold text-ink-soft hover:text-tomato">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-ink-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span>© {new Date().getFullYear()} Gig Kitchens. All rights reserved.</span>
          <span className="flex gap-4">
            <Link href="/safety" className="hover:text-ink">
              Trust & safety
            </Link>
            <Link href="/terms" className="hover:text-ink">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-ink">
              Privacy
            </Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
