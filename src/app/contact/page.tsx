import type { Metadata } from "next";
import { StaticPage } from "@/components/static-page";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <StaticPage eyebrow="Contact" title="Say hello" blurb="Questions, an order that went sideways, or a neighborhood that needs us. We read everything.">
      <div className="grid gap-5 md:grid-cols-3">
        <Card title="Order help" body="Something late, cold, or missing? Open the order page and tap Report, or email us with the order number." link="mailto:help@gigkitchens.com" label="help@gigkitchens.com" />
        <Card title="Cooks" body="Onboarding, certificates, payouts, or a question about your kitchen review." link="mailto:cooks@gigkitchens.com" label="cooks@gigkitchens.com" />
        <Card title="Bring us to your street" body="Tell us your neighborhood and the cook everyone already talks about." link="mailto:hello@gigkitchens.com" label="hello@gigkitchens.com" />
      </div>
    </StaticPage>
  );
}

function Card({ title, body, link, label }: { title: string; body: string; link: string; label: string }) {
  return (
    <div className="card p-5">
      <h2 className="text-lg font-bold">{title}</h2>
      <p className="mt-1 text-sm text-ink-soft">{body}</p>
      <a href={link} className="mt-3 inline-block text-sm font-bold text-tomato hover:underline">
        {label}
      </a>
    </div>
  );
}
