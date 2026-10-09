import type { Metadata } from "next";
import { StaticPage, Prose } from "@/components/static-page";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <StaticPage eyebrow="Legal" title="Privacy">
      <Prose>
        <p>This is a plain-language draft for the Gig Kitchens pilot and should be reviewed by counsel before launch.</p>
        <h2>What we collect</h2>
        <p>Your name, email, neighborhood, and the address you give us for drop-off or delivery. Order history, ratings, and community posts. Payment details are handled by our payment processor and never stored on our servers.</p>
        <h2>What we share</h2>
        <p>Cooks see your first name, your neighborhood, your order, your note, and, for drop-off or delivery, your address. Neighbors see your first name and neighborhood next to your ratings and posts. We do not sell personal data.</p>
        <h2>Your choices</h2>
        <p>You can edit your profile at any time and ask us to delete your account by emailing hello@gigkitchens.com.</p>
      </Prose>
    </StaticPage>
  );
}
