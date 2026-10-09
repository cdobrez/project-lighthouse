import Image from "next/image";
import { photoSrc, PHOTO_ALT, CUISINE_EMOJI } from "@/lib/images";

type Props = {
  imageKey: string;
  alt?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  fallbackLabel?: string;
  fallbackHue?: number;
};

/**
 * Renders a site photo by key with next/image. When a key has no photo yet
 * (for example a brand-new meal from a cook), a warm illustrated tile stands in.
 */
export function Photo({ imageKey, alt, className = "", sizes, priority, fallbackLabel, fallbackHue = 24 }: Props) {
  const src = photoSrc(imageKey);
  const label = alt ?? PHOTO_ALT[imageKey] ?? fallbackLabel ?? "";
  if (!src) {
    const emoji = CUISINE_EMOJI[fallbackLabel ?? ""] ?? "🍽️";
    return (
      <div
        className={`relative flex h-full w-full items-center justify-center overflow-hidden ${className}`}
        style={{
          background: `radial-gradient(120% 90% at 20% 10%, hsl(${fallbackHue} 70% 90%) 0%, hsl(${fallbackHue} 55% 78%) 60%, hsl(${(fallbackHue + 25) % 360} 45% 70%) 100%)`,
        }}
        role="img"
        aria-label={label}
      >
        <span className="select-none text-6xl drop-shadow-sm sm:text-7xl" aria-hidden>
          {emoji}
        </span>
        <span className="absolute bottom-2 right-3 rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink-soft">
          Photo coming soon
        </span>
      </div>
    );
  }
  return (
    <Image
      src={src}
      alt={label}
      fill
      sizes={sizes ?? "(max-width: 768px) 100vw, 50vw"}
      className={`object-cover ${className}`}
      priority={priority}
    />
  );
}
