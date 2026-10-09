export function Avatar({ name, hue = 20, size = 36, className = "" }: { name: string; hue?: number; size?: number; className?: string }) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-display font-bold text-white ring-2 ring-paper ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.4, background: `linear-gradient(135deg, hsl(${hue} 55% 55%), hsl(${(hue + 30) % 360} 60% 42%))` }}
      aria-hidden
    >
      {initials}
    </span>
  );
}
