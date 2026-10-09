type Props = { value: number; count?: number; size?: "sm" | "md" | "lg"; showValue?: boolean; className?: string };

export function RatingStars({ value, count, size = "sm", showValue = true, className = "" }: Props) {
  const px = size === "lg" ? 22 : size === "md" ? 17 : 14;
  const rounded = Math.round(value * 2) / 2;
  return (
    <span className={`inline-flex items-center gap-1 ${className}`} aria-label={`${value.toFixed(1)} out of 5 stars`}>
      <span className="inline-flex" aria-hidden>
        {[1, 2, 3, 4, 5].map((i) => {
          const fill = rounded >= i ? 1 : rounded >= i - 0.5 ? 0.5 : 0;
          return <Star key={i} fill={fill} px={px} />;
        })}
      </span>
      {showValue && value > 0 && <span className="text-sm font-bold text-ink">{value.toFixed(1)}</span>}
      {typeof count === "number" && <span className="text-xs text-ink-muted">({count})</span>}
      {value === 0 && showValue && <span className="text-xs text-ink-muted">New</span>}
    </span>
  );
}

function Star({ fill, px }: { fill: number; px: number }) {
  const id = `g${Math.round(fill * 10)}`;
  return (
    <svg width={px} height={px} viewBox="0 0 24 24" className="shrink-0">
      <defs>
        <linearGradient id={id}>
          <stop offset={`${fill * 100}%`} stopColor="#e9a33b" />
          <stop offset={`${fill * 100}%`} stopColor="#e6dccb" />
        </linearGradient>
      </defs>
      <path
        d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6L2.5 9.4l6.6-.8z"
        fill={`url(#${id})`}
        stroke="#d99a2b"
        strokeWidth="0.6"
      />
    </svg>
  );
}
