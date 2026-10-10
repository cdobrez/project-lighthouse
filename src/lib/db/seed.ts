import type { Db } from "./index";
import * as s from "./schema";
import { newId, slugify } from "@/lib/ids";
import { hashPassword } from "@/lib/password";

type SeedCook = {
  name: string;
  email: string;
  displayName: string;
  tagline: string;
  bio: string;
  kitchenStory: string;
  neighborhood: string;
  zip: string;
  specialties: string[];
  fulfillment: string[];
  years: number;
  imageKey: string;
  hue: number;
  meals: SeedMeal[];
};

type SeedMeal = {
  title: string;
  description: string;
  story: string;
  cuisine: string;
  price: number;
  servings: number;
  dietary: string[];
  ingredients: string[];
  allergens: string[];
  imageKey: string;
  days: string[];
  window: string;
  portions: number;
};

const COOKS: SeedCook[] = [
  {
    name: "Rosa Delgado",
    email: "rosa@example.com",
    displayName: "Rosa's Kitchen",
    tagline: "Sunday-sauce Italian, the way my nonna made it",
    bio: "I grew up stirring a pot taller than I was. After 30 years of feeding a family of six, cooking for the neighborhood keeps my kitchen happy and loud.",
    kitchenStory:
      "My kitchen is the heart of the house. Copper pots, a basil plant on the sill, and a radio that only plays old Motown.",
    neighborhood: "Maple Grove",
    zip: "60515",
    specialties: ["Italian", "Comfort food", "Baked pasta"],
    fulfillment: ["pickup", "dropoff", "delivery"],
    years: 32,
    imageKey: "cook-rosa",
    hue: 18,
    meals: [
      {
        title: "Nonna's Baked Lasagna",
        description:
          "Twelve layers of fresh pasta, slow-simmered beef and pork ragù, creamy béchamel, and a blanket of mozzarella. Comes bubbling in a glass dish you return next week.",
        story: "This is the recipe my grandmother carried from Bologna. It takes all afternoon, which is exactly why nobody has time to make it anymore.",
        cuisine: "Italian",
        price: 1600,
        servings: 2,
        dietary: [],
        ingredients: ["fresh egg pasta", "ground beef", "ground pork", "San Marzano tomatoes", "whole milk", "parmesan", "mozzarella", "nutmeg"],
        allergens: ["wheat", "dairy", "egg"],
        imageKey: "meal-lasagna",
        days: ["Sun", "Wed", "Fri"],
        window: "5:00 - 7:00 pm",
        portions: 12,
      },
      {
        title: "Chicken Cacciatore with Polenta",
        description: "Bone-in chicken thighs braised with peppers, mushrooms, and rosemary over soft parmesan polenta.",
        story: "Hunter-style stew, cooked low and slow while I read the paper.",
        cuisine: "Italian",
        price: 1400,
        servings: 1,
        dietary: ["gluten-free"],
        ingredients: ["chicken thighs", "bell peppers", "cremini mushrooms", "white wine", "tomatoes", "rosemary", "polenta", "parmesan"],
        allergens: ["dairy"],
        imageKey: "meal-cacciatore",
        days: ["Tue", "Thu"],
        window: "5:30 - 7:00 pm",
        portions: 10,
      },
      {
        title: "Minestrone & Focaccia",
        description: "A big bowl of garden minestrone with cannellini beans and a wedge of rosemary focaccia baked that morning.",
        story: "Whatever is in the garden goes in the pot. Lately that means zucchini and lots of basil.",
        cuisine: "Italian",
        price: 1100,
        servings: 1,
        dietary: ["vegetarian", "vegan option"],
        ingredients: ["cannellini beans", "zucchini", "carrots", "celery", "tomatoes", "ditalini", "basil", "flour", "olive oil"],
        allergens: ["wheat"],
        imageKey: "meal-minestrone",
        days: ["Mon", "Wed", "Fri"],
        window: "4:30 - 6:30 pm",
        portions: 14,
      },
    ],
  },
  {
    name: "Priya Raman",
    email: "priya@example.com",
    displayName: "Priya's Home Kitchen",
    tagline: "South Indian weeknight dinners, spice dialed to your family",
    bio: "Software engineer by day, dosa flipper by night. I cook the food my mom made in Chennai, with a little less chili unless you ask.",
    kitchenStory: "A small, spotless kitchen with a well-worn tawa, three kinds of dal in glass jars, and a very interested golden retriever on the other side of the gate.",
    neighborhood: "Maple Grove",
    zip: "60515",
    specialties: ["South Indian", "Vegetarian", "Meal prep"],
    fulfillment: ["pickup", "dropoff"],
    years: 12,
    imageKey: "cook-priya",
    hue: 300,
    meals: [
      {
        title: "Weeknight Thali",
        description: "Sambar, a seasonal vegetable poriyal, rasam, basmati rice, yogurt, and two warm chapatis. The whole plate, packed neatly in compartments.",
        story: "This is what dinner looked like every night growing up. Balanced, warm, and done in time for homework.",
        cuisine: "Indian",
        price: 1300,
        servings: 1,
        dietary: ["vegetarian", "nut-free"],
        ingredients: ["toor dal", "tamarind", "seasonal vegetables", "basmati rice", "yogurt", "whole wheat flour", "curry leaves", "mustard seed"],
        allergens: ["wheat", "dairy"],
        imageKey: "meal-thali",
        days: ["Mon", "Tue", "Wed", "Thu"],
        window: "5:00 - 6:30 pm",
        portions: 16,
      },
      {
        title: "Butter Chicken & Jeera Rice",
        description: "Tender chicken in a mellow tomato-cream sauce, cumin rice, and a side of cucumber raita. Mild by default, spicy on request.",
        story: "The dish that turned my husband's whole family into regulars at our table.",
        cuisine: "Indian",
        price: 1500,
        servings: 1,
        dietary: ["gluten-free"],
        ingredients: ["chicken thighs", "tomatoes", "cream", "butter", "garam masala", "fenugreek", "basmati rice", "cumin", "yogurt", "cucumber"],
        allergens: ["dairy"],
        imageKey: "meal-butter-chicken",
        days: ["Fri", "Sat"],
        window: "5:30 - 7:30 pm",
        portions: 12,
      },
    ],
  },
  {
    name: "Marcus Bell",
    email: "marcus@example.com",
    displayName: "Marcus Smokes",
    tagline: "Low-and-slow barbecue from the backyard pit",
    bio: "Retired firefighter. I used to cook for the whole station, now I cook for the whole block. The smoker goes on at 5 am, dinner is ready by 5 pm.",
    kitchenStory: "An offset smoker on the patio, a chalkboard with the day's cuts, and a kitchen inside where the sides and the cornbread happen.",
    neighborhood: "Riverbend",
    zip: "60516",
    specialties: ["Barbecue", "Southern", "Big batches"],
    fulfillment: ["pickup", "delivery"],
    years: 25,
    imageKey: "cook-marcus",
    hue: 200,
    meals: [
      {
        title: "Smoked Brisket Plate",
        description: "Half a pound of 14-hour oak-smoked brisket, collard greens, mac and cheese, and a square of honey cornbread.",
        story: "I learned patience on the job. The brisket taught me the rest.",
        cuisine: "Barbecue",
        price: 1900,
        servings: 1,
        dietary: [],
        ingredients: ["beef brisket", "black pepper", "collard greens", "smoked turkey", "elbow macaroni", "cheddar", "cornmeal", "honey"],
        allergens: ["wheat", "dairy", "egg"],
        imageKey: "meal-brisket",
        days: ["Fri", "Sat", "Sun"],
        window: "5:00 - 7:00 pm",
        portions: 20,
      },
      {
        title: "Pulled Pork Family Pack",
        description: "Two pounds of pulled pork, a dozen potato rolls, slaw, pickles, and two sauces. Feeds four hungry people with leftovers.",
        story: "The Friday night pack. Grab it on the way home and nobody has to argue about dinner.",
        cuisine: "Barbecue",
        price: 4800,
        servings: 4,
        dietary: [],
        ingredients: ["pork shoulder", "potato rolls", "cabbage", "carrots", "apple cider vinegar", "pickles"],
        allergens: ["wheat", "egg"],
        imageKey: "meal-pulled-pork",
        days: ["Fri", "Sat"],
        window: "4:30 - 7:00 pm",
        portions: 8,
      },
    ],
  },
  {
    name: "Linh Tran",
    email: "linh@example.com",
    displayName: "Linh's Pho House",
    tagline: "Broth simmered 18 hours, served with a smile",
    bio: "I run a tiny tutoring business and cook pho on the side because the neighborhood asked. The broth starts the night before and the house smells like star anise all day.",
    kitchenStory: "Two stockpots, a rice cooker that has never been turned off, and a windowsill full of herbs.",
    neighborhood: "Riverbend",
    zip: "60516",
    specialties: ["Vietnamese", "Soups", "Light & fresh"],
    fulfillment: ["pickup", "dropoff", "delivery"],
    years: 9,
    imageKey: "cook-linh",
    hue: 150,
    meals: [
      {
        title: "Beef Pho Kit",
        description: "A quart of 18-hour beef broth, rice noodles, sliced brisket and rare eye of round, herbs, lime, and jalapeño. Assemble hot at home in three minutes.",
        story: "Pho travels best as a kit. Pour the broth over everything and it tastes like it was made at your table, because it was.",
        cuisine: "Vietnamese",
        price: 1500,
        servings: 1,
        dietary: ["gluten-free", "dairy-free"],
        ingredients: ["beef bones", "brisket", "eye of round", "rice noodles", "star anise", "ginger", "fish sauce", "thai basil", "bean sprouts", "lime"],
        allergens: ["fish"],
        imageKey: "meal-pho",
        days: ["Tue", "Thu", "Sat"],
        window: "5:00 - 7:00 pm",
        portions: 14,
      },
      {
        title: "Lemongrass Chicken Rice Bowl",
        description: "Grilled lemongrass chicken thighs over jasmine rice with pickled carrots, cucumber, and nuoc cham.",
        story: "My kids' favorite. It is the meal they ask for after soccer.",
        cuisine: "Vietnamese",
        price: 1300,
        servings: 1,
        dietary: ["gluten-free", "dairy-free"],
        ingredients: ["chicken thighs", "lemongrass", "garlic", "jasmine rice", "carrots", "daikon", "cucumber", "fish sauce", "lime"],
        allergens: ["fish"],
        imageKey: "meal-lemongrass-chicken",
        days: ["Mon", "Wed", "Fri"],
        window: "5:00 - 6:30 pm",
        portions: 12,
      },
      {
        title: "Tofu Spring Rolls (8)",
        description: "Eight fresh rolls with crispy tofu, vermicelli, mint, and lettuce, with peanut dipping sauce. Great as a light dinner or a shared side.",
        story: "Rolled by hand at the kitchen table, usually with help from a seven-year-old.",
        cuisine: "Vietnamese",
        price: 1000,
        servings: 2,
        dietary: ["vegan", "gluten-free"],
        ingredients: ["rice paper", "tofu", "rice vermicelli", "mint", "lettuce", "carrots", "peanuts", "hoisin"],
        allergens: ["peanut", "soy"],
        imageKey: "meal-spring-rolls",
        days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
        window: "4:30 - 6:30 pm",
        portions: 10,
      },
    ],
  },
  {
    name: "Hannah Okafor",
    email: "hannah@example.com",
    displayName: "Hannah's Sunday Supper",
    tagline: "Roast chicken, real gravy, and a pie if you're lucky",
    bio: "Stay-at-home mom of three. I was already cooking for a crowd, so cooking for a few more neighbors made perfect sense.",
    kitchenStory: "A farmhouse table that doubles as homework central, a Dutch oven that is older than me, and a pie safe that is never empty for long.",
    neighborhood: "Oak Hollow",
    zip: "60514",
    specialties: ["American", "Roasts", "Baking"],
    fulfillment: ["pickup", "dropoff"],
    years: 15,
    imageKey: "cook-hannah",
    hue: 45,
    meals: [
      {
        title: "Herb Roast Chicken Dinner",
        description: "A half roast chicken with lemon and thyme, buttery mashed potatoes, honey-glazed carrots, and pan gravy.",
        story: "The dinner my family expects every Sunday. Now it comes on Wednesdays too.",
        cuisine: "American",
        price: 1700,
        servings: 2,
        dietary: ["gluten-free"],
        ingredients: ["whole chicken", "lemon", "thyme", "yukon potatoes", "butter", "cream", "carrots", "honey"],
        allergens: ["dairy"],
        imageKey: "meal-roast-chicken",
        days: ["Wed", "Sun"],
        window: "5:00 - 7:00 pm",
        portions: 10,
      },
      {
        title: "Shepherd's Pie",
        description: "Ground lamb and vegetables in a rich gravy under a golden mashed-potato crust. Reheats like a dream.",
        story: "My husband's grandmother's recipe, with a splash more Worcestershire than she would admit to.",
        cuisine: "American",
        price: 1400,
        servings: 2,
        dietary: [],
        ingredients: ["ground lamb", "onion", "carrots", "peas", "beef stock", "worcestershire", "potatoes", "butter", "cheddar"],
        allergens: ["dairy", "wheat"],
        imageKey: "meal-shepherds-pie",
        days: ["Mon", "Thu"],
        window: "5:00 - 6:30 pm",
        portions: 12,
      },
      {
        title: "Apple Crumble Pie",
        description: "A whole 9-inch pie. Honeycrisp apples, cinnamon, and an oat crumble top. Serve warm.",
        story: "Baked between school pickups. Best eaten with the people you live with.",
        cuisine: "Dessert",
        price: 2200,
        servings: 8,
        dietary: ["vegetarian"],
        ingredients: ["honeycrisp apples", "flour", "butter", "oats", "brown sugar", "cinnamon"],
        allergens: ["wheat", "dairy"],
        imageKey: "meal-apple-pie",
        days: ["Fri", "Sat", "Sun"],
        window: "3:00 - 6:00 pm",
        portions: 6,
      },
    ],
  },
  {
    name: "Tomas Herrera",
    email: "tomas@example.com",
    displayName: "Casa Herrera",
    tagline: "Oaxacan home cooking and a mole that takes two days",
    bio: "I moved here from Oaxaca twelve years ago and missed the food so much I had to cook it myself. Now half of Oak Hollow misses it too.",
    kitchenStory: "A comal on the stove, tortillas pressed by hand every afternoon, and a stack of molcajetes that get real use.",
    neighborhood: "Oak Hollow",
    zip: "60514",
    specialties: ["Mexican", "Oaxacan", "Handmade tortillas"],
    fulfillment: ["pickup", "dropoff", "delivery"],
    years: 20,
    imageKey: "cook-tomas",
    hue: 350,
    meals: [
      {
        title: "Chicken Mole Negro",
        description: "Chicken in a deep, smoky black mole with rice, black beans, and six handmade corn tortillas.",
        story: "Twenty-eight ingredients and two days. You cannot rush mole, and you should not try.",
        cuisine: "Mexican",
        price: 1800,
        servings: 1,
        dietary: ["gluten-free"],
        ingredients: ["chicken", "chilhuacle chiles", "pasilla chiles", "chocolate", "almonds", "sesame", "plantain", "corn masa", "black beans", "rice"],
        allergens: ["tree nuts", "sesame"],
        imageKey: "meal-mole",
        days: ["Sat", "Sun"],
        window: "4:00 - 7:00 pm",
        portions: 12,
      },
      {
        title: "Carnitas Taco Night (for 4)",
        description: "A pound and a half of slow-cooked carnitas, sixteen handmade tortillas, salsa verde, pickled onions, cilantro, and limes.",
        story: "Set it in the middle of the table and let everyone build their own. Taco night should be loud.",
        cuisine: "Mexican",
        price: 4200,
        servings: 4,
        dietary: ["gluten-free", "dairy-free"],
        ingredients: ["pork shoulder", "orange", "corn masa", "tomatillos", "serrano", "red onion", "cilantro", "lime"],
        allergens: [],
        imageKey: "meal-carnitas",
        days: ["Tue", "Fri"],
        window: "5:00 - 7:00 pm",
        portions: 8,
      },
      {
        title: "Black Bean & Sweet Potato Enchiladas",
        description: "Four enchiladas in a roasted tomato sauce with black beans, sweet potato, and queso fresco. Vegetarian and hearty.",
        story: "What I make when the vegetarian cousins come to visit.",
        cuisine: "Mexican",
        price: 1300,
        servings: 1,
        dietary: ["vegetarian", "gluten-free"],
        ingredients: ["corn tortillas", "black beans", "sweet potato", "roasted tomatoes", "guajillo chile", "queso fresco", "crema"],
        allergens: ["dairy"],
        imageKey: "meal-enchiladas",
        days: ["Mon", "Wed", "Thu"],
        window: "5:00 - 6:30 pm",
        portions: 12,
      },
    ],
  },
];

const CUSTOMERS = [
  { name: "Demo Neighbor", email: "demo@gigkitchens.com", neighborhood: "Maple Grove", zip: "60515", hue: 210 },
  { name: "Gig Kitchens Owner", email: "owner@gigkitchens.com", neighborhood: "Maple Grove", zip: "60515", hue: 20, role: "admin" },
  { name: "Jen Alvarez", email: "jen@example.com", neighborhood: "Maple Grove", zip: "60515", hue: 120 },
  { name: "Dev Patel", email: "dev@example.com", neighborhood: "Riverbend", zip: "60516", hue: 260 },
  { name: "Carla Nguyen", email: "carla@example.com", neighborhood: "Oak Hollow", zip: "60514", hue: 30 },
  { name: "Sam Whitfield", email: "sam@example.com", neighborhood: "Oak Hollow", zip: "60514", hue: 180 },
];

const REVIEW_LINES = [
  "Tasted exactly like something my mom would make. Kids cleaned their plates.",
  "Picked it up on the way home and the whole house smelled amazing within a minute.",
  "Honestly better than the restaurant version, and it came in a real dish.",
  "Dropped at the door right on time, still hot. This is how dinner should work.",
  "Generous portion. We had enough for lunch the next day.",
  "So nice to eat a real meal on a Tuesday without the dishes afterwards.",
  "Perfectly seasoned, and the note on the lid made my night.",
  "We have ordered this four weeks in a row. No notes.",
];

const POSTS = [
  {
    kind: "post",
    neighborhood: "Maple Grove",
    title: "Rosa's lasagna saved our Wednesday",
    body: "Soccer practice ran late, nobody wanted to cook, and there it was on the porch in a glass dish. Returned the dish today with a thank-you card from the kids.",
  },
  {
    kind: "event",
    neighborhood: "Maple Grove",
    title: "Block potluck at Maple Grove Park, Saturday 5 pm",
    body: "Bring a dish or just bring yourself. Three of our Gig Kitchens cooks are bringing samples. Blankets and lawn chairs welcome.",
    eventAt: "Saturday 5:00 pm",
  },
  {
    kind: "request",
    neighborhood: "Riverbend",
    title: "Anyone cook Polish food?",
    body: "My grandmother used to make pierogi every Sunday and I would love to find someone nearby who makes them from scratch. Happy to be a loyal customer.",
  },
  {
    kind: "recipe",
    neighborhood: "Oak Hollow",
    title: "Hannah's trick for crispier roast chicken skin",
    body: "Pat it dry, salt it the night before, and leave it uncovered in the fridge. That is the whole secret. The gravy is a different story.",
  },
  {
    kind: "post",
    neighborhood: "Riverbend",
    title: "New to the neighborhood, already fed",
    body: "We moved in Friday with nothing unpacked and Linh's pho kit was on our doorstep by 6. Thank you to whoever sent it. We are staying.",
  },
];

export async function seedIfEmpty(db: Db) {
  const existing = await db.select({ id: s.users.id }).from(s.users).limit(1).all();
  if (existing.length > 0) return;

  const password = hashPassword("neighbor123");
  const customerIds: Record<string, string> = {};

  await db.transaction(async (tx) => {
    for (const c of CUSTOMERS) {
      const id = newId("usr");
      customerIds[c.email] = id;
      await tx.insert(s.users)
        .values({
          id,
          name: c.name,
          email: c.email,
          passwordHash: password,
          role: "role" in c && c.role ? c.role : "customer",
          neighborhood: c.neighborhood,
          zip: c.zip,
          address: `${100 + Math.floor(Math.random() * 800)} Elm St, ${c.neighborhood}`,
          avatarHue: c.hue,
        })
        .run();
    }

    const allMealIds: { mealId: string; cookId: string }[] = [];
    const cookIds: string[] = [];

    for (const c of COOKS) {
      const userId = newId("usr");
      await tx.insert(s.users)
        .values({
          id: userId,
          name: c.name,
          email: c.email,
          passwordHash: password,
          neighborhood: c.neighborhood,
          zip: c.zip,
          address: `${100 + Math.floor(Math.random() * 800)} Birch Ln, ${c.neighborhood}`,
          avatarHue: c.hue,
        })
        .run();

      const cookId = newId("cook");
      cookIds.push(cookId);
      await tx.insert(s.cooks)
        .values({
          id: cookId,
          userId,
          displayName: c.displayName,
          slug: slugify(c.displayName),
          tagline: c.tagline,
          bio: c.bio,
          kitchenStory: c.kitchenStory,
          neighborhood: c.neighborhood,
          zip: c.zip,
          specialties: c.specialties,
          fulfillment: c.fulfillment,
          deliveryRadiusMiles: c.fulfillment.includes("delivery") ? 5 : 2,
          foodHandlerCertified: true,
          kitchenInspected: true,
          yearsCooking: c.years,
          imageKey: c.imageKey,
          mealsServed: 120 + Math.floor(Math.random() * 600),
        })
        .run();

      for (const m of c.meals) {
        const mealId = newId("meal");
        allMealIds.push({ mealId, cookId });
        await tx.insert(s.meals)
          .values({
            id: mealId,
            cookId,
            title: m.title,
            slug: slugify(m.title),
            description: m.description,
            story: m.story,
            cuisine: m.cuisine,
            priceCents: m.price,
            servings: m.servings,
            dietaryTags: m.dietary,
            ingredients: m.ingredients,
            allergens: m.allergens,
            imageKey: m.imageKey,
            availableDays: m.days,
            readyWindow: m.window,
            portionsAvailable: m.portions,
            fulfillment: c.fulfillment,
            timesOrdered: 20 + Math.floor(Math.random() * 200),
          })
          .run();
      }
    }

    // Reviews: a few per meal from a rotating set of customers.
    const customerList = Object.entries(customerIds)
      .filter(([email]) => email !== "owner@gigkitchens.com")
      .map(([, id]) => id);
    let line = 0;
    for (const { mealId, cookId } of allMealIds) {
      const count = 3 + Math.floor(Math.random() * 4);
      let sum = 0;
      for (let i = 0; i < count; i++) {
        const rating = Math.random() < 0.75 ? 5 : 4;
        sum += rating;
        await tx.insert(s.reviews)
          .values({
            id: newId("rev"),
            userId: customerList[(line + i) % customerList.length],
            cookId,
            mealId,
            rating,
            comment: REVIEW_LINES[(line + i) % REVIEW_LINES.length],
          })
          .run();
      }
      line += count;
      await tx.update(s.meals)
        .set({ ratingAvg: Math.round((sum / count) * 10) / 10, ratingCount: count })
        .where(eqId(s.meals.id, mealId))
        .run();
    }

    for (const cookId of cookIds) {
      const rows = await tx.select({ r: s.reviews.rating }).from(s.reviews).where(eqId(s.reviews.cookId, cookId)).all();
      const avg = rows.length ? rows.reduce((a, b) => a + b.r, 0) / rows.length : 0;
      await tx.update(s.cooks)
        .set({ ratingAvg: Math.round(avg * 10) / 10, ratingCount: rows.length })
        .where(eqId(s.cooks.id, cookId))
        .run();
    }

    // Sample order history so demo dashboards aren't empty.
    const demoId = customerIds["demo@gigkitchens.com"];
    const mealRows = await tx.select().from(s.meals).all();
    const byTitle = (title: string) => mealRows.find((m) => m.title === title)!;
    await tx.insert(s.waitlist)
      .values([
        { id: newId("wl"), email: "neighbor1@example.com", zip: "60521", neighborhood: "Hinsdale", wantsToCook: false, note: "" },
        { id: newId("wl"), email: "bakerjane@example.com", zip: "60559", neighborhood: "Westmont", wantsToCook: true, note: "I bake sourdough every weekend and always have extra." },
      ])
      .run();

    const sampleOrders: { customer: string; meal: string; qty: number; fulfillment: string; status: string; daysAgo: number; tip: number; note?: string }[] = [
      { customer: demoId, meal: "Nonna's Baked Lasagna", qty: 2, fulfillment: "dropoff", status: "delivered", daysAgo: 9, tip: 0.15, note: "Side gate is open." },
      { customer: demoId, meal: "Weeknight Thali", qty: 1, fulfillment: "pickup", status: "picked_up", daysAgo: 5, tip: 0.1 },
      { customer: demoId, meal: "Beef Pho Kit", qty: 2, fulfillment: "delivery", status: "delivered", daysAgo: 2, tip: 0.2, note: "Extra lime if you have it!" },
      { customer: demoId, meal: "Herb Roast Chicken Dinner", qty: 1, fulfillment: "dropoff", status: "accepted", daysAgo: 0, tip: 0.1 },
      { customer: customerIds["jen@example.com"], meal: "Minestrone & Focaccia", qty: 3, fulfillment: "pickup", status: "placed", daysAgo: 0, tip: 0 },
      { customer: customerIds["dev@example.com"], meal: "Chicken Cacciatore with Polenta", qty: 2, fulfillment: "delivery", status: "cooking", daysAgo: 0, tip: 0.15 },
      { customer: customerIds["carla@example.com"], meal: "Smoked Brisket Plate", qty: 2, fulfillment: "pickup", status: "picked_up", daysAgo: 3, tip: 0.2 },
      { customer: customerIds["sam@example.com"], meal: "Chicken Mole Negro", qty: 1, fulfillment: "dropoff", status: "delivered", daysAgo: 6, tip: 0.1 },
    ];
    for (const o of sampleOrders) {
      const meal = byTitle(o.meal);
      const subtotal = meal.priceCents * o.qty;
      const fee = Math.round(subtotal * 0.08);
      const delivery = o.fulfillment === "delivery" ? 399 : 0;
      const tip = Math.round(subtotal * o.tip);
      const when = new Date(Date.now() - o.daysAgo * 86400000).toISOString().slice(0, 19).replace("T", " ");
      const orderId = newId("ord");
      const customer = await tx.select().from(s.users).where(eqId(s.users.id, o.customer)).get()!;
      await tx.insert(s.orders)
        .values({
          id: orderId,
          userId: o.customer,
          cookId: meal.cookId,
          status: o.status,
          fulfillment: o.fulfillment,
          address: o.fulfillment === "pickup" ? "" : customer?.address ?? "",
          scheduledFor: `${o.daysAgo === 0 ? "Tonight" : "Earlier"} · ${meal.readyWindow}`,
          note: o.note ?? "",
          subtotalCents: subtotal,
          feeCents: fee,
          deliveryCents: delivery,
          tipCents: tip,
          totalCents: subtotal + fee + delivery + tip,
          paymentRef: `demo_${newId()}`,
          createdAt: when,
          updatedAt: when,
        })
        .run();
      await tx.insert(s.orderItems).values({ id: newId("oi"), orderId, mealId: meal.id, title: meal.title, qty: o.qty, unitCents: meal.priceCents }).run();
    }

    for (const p of POSTS) {
      const author = customerList[Math.floor(Math.random() * customerList.length)];
      await tx.insert(s.posts)
        .values({
          id: newId("post"),
          userId: author,
          neighborhood: p.neighborhood,
          kind: p.kind,
          title: p.title,
          body: p.body,
          eventAt: p.eventAt ?? null,
          likes: 3 + Math.floor(Math.random() * 30),
        })
        .run();
    }
  });
}

import { eq } from "drizzle-orm";
import type { SQLiteColumn } from "drizzle-orm/sqlite-core";
function eqId(col: SQLiteColumn, value: string) {
  return eq(col, value);
}
