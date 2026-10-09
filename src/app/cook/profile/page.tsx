import type { Metadata } from "next";
import { requireCook } from "@/lib/auth";
import { CookForm } from "@/components/cook/cook-form";

export const metadata: Metadata = { title: "Kitchen profile" };

export default async function CookProfilePage() {
  const cook = await requireCook();
  return (
    <div className="max-w-3xl">
      <h2 className="text-xl font-bold">Your kitchen profile</h2>
      <p className="mb-4 text-sm text-ink-soft">This is what neighbors see on your public page.</p>
      <CookForm cook={cook} />
    </div>
  );
}
