export function money(cents: number): string {
  return (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export function plural(n: number, word: string, pluralWord?: string): string {
  return `${n} ${n === 1 ? word : pluralWord ?? `${word}s`}`;
}

export function timeAgo(iso: string): string {
  const then = new Date(iso.includes("T") ? iso : iso.replace(" ", "T") + "Z").getTime();
  const diff = Math.max(0, Date.now() - then);
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  const w = Math.floor(d / 7);
  if (w < 5) return `${w}w ago`;
  return new Date(then).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export const FULFILLMENT_LABELS: Record<string, { label: string; short: string; blurb: string }> = {
  pickup: { label: "Pick up", short: "Pickup", blurb: "Swing by the cook's porch during the ready window." },
  dropoff: { label: "Porch drop-off", short: "Drop-off", blurb: "The cook walks it over and leaves it at your door." },
  delivery: { label: "Delivery", short: "Delivery", blurb: "A neighbor courier brings it to you, hot." },
};

export const DAY_ORDER = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function todayLabel(): string {
  return DAY_ORDER[(new Date().getDay() + 6) % 7];
}

export function nextAvailableDay(days: string[]): string | null {
  if (!days.length) return null;
  const todayIdx = (new Date().getDay() + 6) % 7;
  for (let i = 0; i < 7; i++) {
    const d = DAY_ORDER[(todayIdx + i) % 7];
    if (days.includes(d)) return i === 0 ? "Today" : i === 1 ? "Tomorrow" : d;
  }
  return null;
}
