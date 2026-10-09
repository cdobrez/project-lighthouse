import Link from "next/link";
import { Section } from "@/components/section";

export default function NotFound() {
  return (
    <Section className="py-24 text-center">
      <p className="text-6xl" aria-hidden>
        🥘
      </p>
      <h1 className="mt-4 text-4xl font-bold tracking-tight">That dish isn&apos;t on the menu</h1>
      <p className="mt-2 text-ink-soft">The page you&apos;re looking for moved, sold out, or never existed.</p>
      <Link href="/meals" className="btn-primary mt-6">
        See tonight&apos;s meals
      </Link>
    </Section>
  );
}
