import type { Metadata } from "next";
import { StaticPage, Prose } from "@/components/static-page";

export const metadata: Metadata = { title: "Food safety & trust", description: "How Gig Kitchens vets cooks, keeps food safe, and keeps ratings honest." };

export default function SafetyPage() {
  return (
    <StaticPage eyebrow="Trust & safety" title="How we keep home cooking safe" blurb="Home kitchens are where most of the world's best food comes from. Here is how we keep them worthy of your trust.">
      <Prose>
        <h2>Every cook</h2>
        <ul>
          <li>Holds a current food handler certificate. We verify a photo of it before their first sale and again every two years.</li>
          <li>Walks us through their kitchen on video. We look for clean surfaces, working refrigeration, a thermometer, and separate prep for raw meat.</li>
          <li>Lists every ingredient and allergen on every meal. Omitting one is grounds for removal.</li>
          <li>Agrees to our hot-and-cold rules: hot food stays above 140°F until hand-off, cold food below 40°F.</li>
          <li>Follows local cottage food and home kitchen rules for their state and county. We help them figure out what applies.</li>
        </ul>
        <h2>Every meal</h2>
        <ul>
          <li>Is packed in a clean, sealed, labeled container with the meal name, the cook, the date, and reheating instructions.</li>
          <li>Carries a ready window. Food is handed off inside that window or the order is refunded.</li>
          <li>Can be rated only by the neighbor who ordered it. No anonymous reviews, no paid reviews.</li>
        </ul>
        <h2>When something goes wrong</h2>
        <p>
          If a meal arrives late, cold, or not as described, tell us from the order page within 24 hours and we refund it in full. Repeated issues pause a cook&apos;s kitchen
          while we talk to them. Any food safety report pauses it immediately.
        </p>
        <h2>Allergies</h2>
        <p>
          Home kitchens are shared kitchens. Even with careful listing, cross-contact with common allergens is possible. If you have a severe allergy, message the cook
          before ordering and use your judgment.
        </p>
      </Prose>
    </StaticPage>
  );
}
