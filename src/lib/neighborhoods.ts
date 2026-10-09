export const NEIGHBORHOODS: { name: string; zip: string; blurb: string }[] = [
  { name: "Maple Grove", zip: "60515", blurb: "Tree-lined streets, big porches, and the Saturday farmers market." },
  { name: "Riverbend", zip: "60516", blurb: "Bike trails along the river and a lot of backyard smokers." },
  { name: "Oak Hollow", zip: "60514", blurb: "Quiet cul-de-sacs, a great park, and serious bakers." },
];

export function neighborhoodForZip(zip: string): string | null {
  return NEIGHBORHOODS.find((n) => n.zip === zip)?.name ?? null;
}
