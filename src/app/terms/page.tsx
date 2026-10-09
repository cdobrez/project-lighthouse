import type { Metadata } from "next";
import { StaticPage, Prose } from "@/components/static-page";

export const metadata: Metadata = { title: "Terms of service" };

export default function TermsPage() {
  return (
    <StaticPage eyebrow="Legal" title="Terms of service">
      <Prose>
        <p>These terms are a plain-language draft for the Gig Kitchens pilot and should be reviewed by counsel before launch.</p>
        <h2>The marketplace</h2>
        <p>Gig Kitchens connects neighbors who cook with neighbors who eat. Cooks are independent; they set their own menus, prices, and schedules. Gig Kitchens processes payments, hosts listings and ratings, and sets safety standards, but does not prepare food.</p>
        <h2>Orders and payment</h2>
        <p>You pay the listed price plus the neighborhood fee and any delivery fee at checkout. Orders can be cancelled free of charge until the cook marks them as cooking. Meals that arrive late, cold, or not as described are refunded when reported within 24 hours.</p>
        <h2>Ratings and community</h2>
        <p>Only neighbors who ordered a meal may rate it. Posts and replies on the community board must be respectful. We remove content that is abusive, misleading, or unsafe.</p>
        <h2>Cooks</h2>
        <p>Cooks must hold a valid food handler certificate, follow applicable local cottage food and home kitchen rules, and list ingredients and allergens accurately. Gig Kitchens may pause or remove a kitchen for safety or quality issues.</p>
      </Prose>
    </StaticPage>
  );
}
