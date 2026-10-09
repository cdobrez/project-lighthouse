# Photography

Every photo is a JPEG in `public/images/<key>.jpg`, served through `next/image`. The registry in `src/lib/images.ts` lists the keys and alt text.

## Scenes (16:9, 1600px wide)

| Key | Used on | Scene |
| --- | --- | --- |
| `hero-front-door` | Home hero | Neighbor handing a covered lasagna to a woman at her front door, golden hour |
| `scene-family-table` | Home, how it works | Family of four passing roast chicken around the table |
| `scene-clean-kitchen` | Home ("a kitchen this clean") | Spotless kitchen after dinner, one dish drying |
| `scene-cook-packing` | Home, become a cook | Home cook labeling glass containers |
| `scene-potluck` | Home, community, about | Backyard block potluck under string lights |
| `scene-pickup` | Login / signup, how it works | Dad and child picking up dinner from a porch |

## Cooks (1:1, 800px)

`cook-rosa`, `cook-priya`, `cook-marcus`, `cook-linh`, `cook-hannah`, `cook-tomas`

## Meals (4:3, 1200px wide)

`meal-lasagna`, `meal-cacciatore`, `meal-minestrone`, `meal-thali`, `meal-butter-chicken`, `meal-brisket`, `meal-pulled-pork`, `meal-pho`, `meal-lemongrass-chicken`, `meal-spring-rolls`, `meal-roast-chicken`, `meal-shepherds-pie`, `meal-apple-pie`, `meal-mole`, `meal-carnitas`, `meal-enchiladas`

## Adding a photo

1. Save a JPEG to `public/images/<key>.jpg` (keep the sizes above; 80% quality is plenty).
2. Add the key to `LOCAL_PHOTOS` in `src/lib/images.ts` and, for scenes, an alt text in `PHOTO_ALT`.
3. Meal keys starting with `meal-` automatically appear in the cook's photo picker when listing a meal.

The current set was generated for the pilot. Replace any of them with real photos of real neighbors whenever you have them; the keys stay the same.
