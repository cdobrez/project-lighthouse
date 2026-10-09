/**
 * Photo registry. Every key maps to /public/images/<key>.jpg.
 * Add a new photo by dropping a JPEG in /public/images and listing its key here
 * (cooks can also type any registered key when creating a meal).
 */
export const LOCAL_PHOTOS = [
  "hero-front-door",
  "scene-family-table",
  "scene-clean-kitchen",
  "scene-cook-packing",
  "scene-potluck",
  "scene-pickup",
  "cook-rosa",
  "cook-priya",
  "cook-marcus",
  "cook-linh",
  "cook-hannah",
  "cook-tomas",
  "meal-lasagna",
  "meal-cacciatore",
  "meal-minestrone",
  "meal-thali",
  "meal-butter-chicken",
  "meal-brisket",
  "meal-pulled-pork",
  "meal-pho",
  "meal-lemongrass-chicken",
  "meal-spring-rolls",
  "meal-roast-chicken",
  "meal-shepherds-pie",
  "meal-apple-pie",
  "meal-mole",
  "meal-carnitas",
  "meal-enchiladas",
] as const;

const LOCAL = new Set<string>(LOCAL_PHOTOS);

export const PHOTO_ALT: Record<string, string> = {
  "hero-front-door": "A neighbor handing a covered home-cooked lasagna to a smiling woman at her front door at golden hour",
  "scene-family-table": "A family of four laughing around the dinner table, passing a dish of roast chicken",
  "scene-clean-kitchen": "A spotless, calm kitchen after dinner with a single rinsed meal container drying on the rack",
  "scene-cook-packing": "A home cook in an apron packing fresh food into glass containers and labeling the lids",
  "scene-potluck": "Neighbors serving each other home-cooked dishes at a backyard block potluck under string lights",
  "scene-pickup": "A dad and his child picking up dinner from a neighbor's front porch",
  "cook-rosa": "Rosa smiling in her kitchen with copper pots and a basil plant",
  "cook-priya": "Priya holding a steel tiffin in her kitchen",
  "cook-marcus": "Marcus beside his backyard smoker",
  "cook-linh": "Linh stirring a stockpot of pho broth",
  "cook-hannah": "Hannah at her farmhouse kitchen table with a pie cooling behind her",
  "cook-tomas": "Tomas pressing corn tortillas in his kitchen",
};

export function photoSrc(key: string): string | null {
  return LOCAL.has(key) ? `/images/${key}.jpg` : null;
}

export function hasPhoto(key: string): boolean {
  return LOCAL.has(key);
}

export const MEAL_PHOTO_KEYS = LOCAL_PHOTOS.filter((k) => k.startsWith("meal-"));

export const CUISINE_EMOJI: Record<string, string> = {
  Italian: "🍝",
  Indian: "🍛",
  Barbecue: "🍖",
  Vietnamese: "🍜",
  American: "🍗",
  Dessert: "🥧",
  Mexican: "🌮",
  Mediterranean: "🥗",
  Chinese: "🥡",
  Japanese: "🍱",
  Thai: "🍲",
  Korean: "🍚",
  Soul: "🍗",
  Vegan: "🥬",
  Baked: "🥖",
};
