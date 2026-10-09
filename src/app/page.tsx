import Link from "next/link";
import { Hero } from "@/components/home/hero";
import { HowItWorks } from "@/components/home/how-it-works";
import { PhotoStory } from "@/components/home/photo-story";
import { CommunityPulse } from "@/components/home/community-pulse";
import { Section, SectionHeading } from "@/components/section";
import { MealCard } from "@/components/meal-card";
import { CookCard } from "@/components/cook-card";
import { listMeals, listCooks, recentReviews, listPosts, siteStats } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const stats = siteStats();
  const meals = listMeals({ sort: "popular" }).slice(0, 6);
  const cooks = listCooks().slice(0, 4);
  const reviews = recentReviews(4);
  const posts = listPosts().slice(0, 4);

  return (
    <>
      <Hero stats={stats} />
      <HowItWorks />

      <Section className="py-10">
        <SectionHeading
          eyebrow="Tonight's menu"
          title="Cooking nearby this week"
          blurb="Each dish is made in a neighbor's kitchen in small batches. Portions run out, so the good stuff goes early."
          action={
            <Link href="/meals" className="btn-secondary">
              Browse all meals
            </Link>
          }
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {meals.map((m) => (
            <MealCard key={m.id} meal={m} />
          ))}
        </div>
      </Section>

      <PhotoStory
        imageKey="scene-family-table"
        eyebrow="Why we started this"
        title="Dinner is a place, not a task."
        body={`Most of us would rather eat a home-cooked meal than takeout. We just run out of hours. Between work, practice, and homework, the pot never makes it to the stove.

Gig Kitchens puts the pot on someone else's stove, a few streets away. The food still tastes like home because it was made in one. You get the table, the conversation, and the leftovers.`}
        caption="The Alvarez family, a Wednesday, Hannah's roast chicken dinner."
        cta={{ href: "/meals", label: "Find dinner near you" }}
      />

      <Section className="py-16">
        <SectionHeading
          eyebrow="Meet the cooks"
          title="Your neighbors who love to feed people"
          blurb="Every cook is food-handler certified, has their kitchen reviewed, and is rated by the people who eat their food."
          action={
            <Link href="/cooks" className="btn-secondary">
              See all cooks
            </Link>
          }
        />
        <div className="grid gap-5 md:grid-cols-2">
          {cooks.map((c) => (
            <CookCard key={c.id} cook={c} mealCount={c.mealCount} />
          ))}
        </div>
      </Section>

      <PhotoStory
        imageKey="scene-clean-kitchen"
        eyebrow="The best part"
        title="A real meal, and a kitchen this clean."
        body={`No pots soaking in the sink. No counters to wipe. No "whose turn is it." Just a rinsed dish to return and an evening that belongs to you.

Cooks pack meals in reusable glass containers. Rinse, return at your next order, and nothing goes to the landfill.`}
        caption="How nice is it to have a clean kitchen and still have eaten a home-cooked meal?"
        flip
        tone="sage"
      />

      <CommunityPulse reviews={reviews} posts={posts} />

      <PhotoStory
        imageKey="scene-cook-packing"
        eyebrow="Cook with us"
        title="Already cooking for your family? Cook for the block."
        body={`Make a double batch of what you were making anyway. List it by noon, hand it off at dinner, and earn real money from your own kitchen on your own schedule.

Cooks on Gig Kitchens keep 92% of every order. Most start with one dish, one night a week.`}
        cta={{ href: "/become-a-cook", label: "Open your kitchen" }}
        tone="butter"
      />

      <PhotoStory
        imageKey="scene-potluck"
        eyebrow="Neighbors, not strangers"
        title="Food is how a street becomes a neighborhood."
        body={`The dish comes back with a thank-you note. The pho shows up on moving day. The block potluck has three Gig Kitchens cooks and a line.

Rate recipes, trade tips, post an event, or ask for the dish you miss from home. Someone nearby probably makes it.`}
        caption="Maple Grove block potluck, last Saturday."
        cta={{ href: "/community", label: "Join the community board" }}
        flip
      />
    </>
  );
}
