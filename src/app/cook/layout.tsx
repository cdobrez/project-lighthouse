import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentCook, getCurrentUser } from "@/lib/auth";
import { Section } from "@/components/section";
import { CookNav } from "@/components/cook/cook-nav";

export const dynamic = "force-dynamic";

export default async function CookLayout({ children }: LayoutProps<"/cook">) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/cook");
  const cook = await getCurrentCook();
  if (!cook) redirect("/become-a-cook");
  return (
    <Section className="py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="eyebrow">Cook dashboard</p>
          <h1 className="text-3xl font-bold tracking-tight">{cook.displayName}</h1>
        </div>
        <Link href={`/cooks/${cook.slug}`} className="btn-secondary">
          View public page
        </Link>
      </div>
      <CookNav />
      <div className="mt-6">{children}</div>
    </Section>
  );
}
