import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { SignupForm } from "@/components/auth/auth-forms";
import { AuthShell } from "@/components/auth/auth-shell";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Join the neighborhood" };

export default async function SignupPage(props: PageProps<"/signup">) {
  const sp = await props.searchParams;
  const next = typeof sp.next === "string" ? sp.next : undefined;
  if (await getCurrentUser()) redirect(next ?? "/meals");
  return (
    <AuthShell title="Pull up a chair" blurb="Create a free account to order from cooks nearby. Takes about thirty seconds.">
      <SignupForm next={next} />
    </AuthShell>
  );
}
