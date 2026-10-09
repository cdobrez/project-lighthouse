import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, getCurrentCook } from "@/lib/auth";
import { listOrdersForUser, listFavoriteMeals } from "@/lib/queries";
import { Section } from "@/components/section";
import { Avatar } from "@/components/avatar";
import { ProfileForm } from "@/components/account/profile-form";
import { LogoutButton } from "@/components/account/logout-button";
import { MealCard } from "@/components/meal-card";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Your account" };

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account");
  const cook = await getCurrentCook();
  const orders = listOrdersForUser(user.id);
  const favorites = listFavoriteMeals(user.id);

  return (
    <Section className="py-10">
      <div className="flex flex-wrap items-center gap-4">
        <Avatar name={user.name} hue={user.avatarHue} size={64} />
        <div>
          <p className="eyebrow">Your account</p>
          <h1 className="text-3xl font-bold tracking-tight">{user.name}</h1>
          <p className="text-sm text-ink-soft">
            {user.neighborhood} · {user.email}
          </p>
        </div>
        <div className="ml-auto flex gap-2">
          {cook ? (
            <Link href="/cook" className="btn-secondary">
              Cook dashboard
            </Link>
          ) : (
            <Link href="/become-a-cook" className="btn-secondary">
              Become a cook
            </Link>
          )}
          <LogoutButton />
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-8">
          <div>
            <div className="flex items-end justify-between">
              <h2 className="text-2xl font-bold">Recent orders</h2>
              <Link href="/orders" className="text-sm font-bold text-tomato hover:underline">
                All orders
              </Link>
            </div>
            {orders.length === 0 ? (
              <p className="card mt-3 p-6 text-sm text-ink-soft">No orders yet. Tonight could be the night.</p>
            ) : (
              <ul className="card mt-3 divide-y divide-line">
                {orders.slice(0, 5).map((o) => (
                  <li key={o.id}>
                    <Link href={`/orders/${o.id}`} className="flex items-center justify-between gap-3 p-4 hover:bg-cream-deep/50">
                      <span>
                        <span className="block font-bold">{o.items.map((i) => `${i.qty}× ${i.title}`).join(", ")}</span>
                        <span className="text-xs text-ink-muted">
                          {o.cook.displayName} · {o.scheduledFor}
                        </span>
                      </span>
                      <span className="chip capitalize">{o.status.replace(/_/g, " ")}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold">Saved meals</h2>
            {favorites.length === 0 ? (
              <p className="card mt-3 p-6 text-sm text-ink-soft">Tap the heart on a meal to keep it here.</p>
            ) : (
              <div className="mt-3 grid gap-5 sm:grid-cols-2">
                {favorites.map((m) => (
                  <MealCard key={m.id} meal={m} />
                ))}
              </div>
            )}
          </div>
        </div>
        <aside>
          <h2 className="text-2xl font-bold">Profile</h2>
          <div className="mt-3">
            <ProfileForm user={{ name: user.name, neighborhood: user.neighborhood, zip: user.zip, address: user.address, phone: user.phone }} />
          </div>
        </aside>
      </div>
    </Section>
  );
}
