import type { Metadata } from "next";
import { StaticPage, Prose } from "@/components/static-page";
import { Photo } from "@/components/photo";

export const metadata: Metadata = { title: "Our story", description: "Why Gig Kitchens exists: more home-cooked dinners, closer neighbors, and extra income for the people who love to cook." };

export default function AboutPage() {
  return (
    <StaticPage eyebrow="Our story" title="We think dinner should taste like somebody made it.">
      <div className="relative mb-8 aspect-[16/9] overflow-hidden rounded-[2rem] ring-1 ring-line">
        <Photo imageKey="scene-potluck" priority sizes="(max-width: 1024px) 100vw, 900px" />
      </div>
      <Prose>
        <p>
          Gig Kitchens started with a simple observation: most of us would rather eat a home-cooked meal than takeout, but we run out of hours. Meanwhile, on the same street,
          there is someone who makes a lasagna their whole extended family talks about, and they make it for four when they could just as easily make it for twelve.
        </p>
        <p>So we built the thing that connects those two houses.</p>
        <h2>What we believe</h2>
        <ul>
          <li>
            <strong>Home cooking is a skill worth paying for.</strong> Cooks set their own prices and keep 92% of every order plus all of their tips.
          </li>
          <li>
            <strong>Trust is local.</strong> Every cook is food-handler certified and kitchen-reviewed, and every rating comes from a real order from a real neighbor.
          </li>
          <li>
            <strong>Food is how a street becomes a neighborhood.</strong> The dish comes back with a note. The pho shows up on moving day. The potluck has a line.
          </li>
          <li>
            <strong>Less waste, less packaging.</strong> Reusable containers, short distances, and small batches of what people actually ordered.
          </li>
        </ul>
        <h2>Where we are</h2>
        <p>
          We are starting in three neighborhoods, Maple Grove, Riverbend, and Oak Hollow, and growing one street at a time. If you want Gig Kitchens where you live, tell us.
          If you want to cook, even better.
        </p>
      </Prose>
    </StaticPage>
  );
}
