import Link from "next/link";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`group inline-flex items-center gap-2.5 ${className}`} aria-label="Gig Kitchens home">
      <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-tomato text-white shadow-[0_4px_12px_-4px_rgb(200_80_47/0.8)] transition-transform group-hover:-rotate-6">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M3 11l9-7 9 7" />
          <path d="M5 10v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9" />
          <path d="M8 20v-4a4 4 0 0 1 8 0v4" />
          <path d="M9 13h6" />
        </svg>
      </span>
      <span className="font-display text-[1.35rem] font-bold leading-none tracking-tight text-ink">
        Gig<span className="text-tomato">Kitchens</span>
      </span>
    </Link>
  );
}
