import type { Category } from "@/app/_types/database.types";

/** Local PNGs in /public/categories — used when DB has no image_url. */
const SLUG_THUMB: Record<string, string> = {
  produce: "/categories/produce.png",
  dairy: "/categories/dairy.png",
  meat: "/categories/meat.png",
  bakery: "/categories/bakery.png",
  beverages: "/categories/beverages.png",
  snacks: "/categories/snacks.png",
  pantry: "/categories/pantry.png",
  "personal-care": "/categories/personal-care.png",
  household: "/categories/household.png",
  "baby-care": "/categories/babycare.png",
  babycare: "/categories/babycare.png",
};

export function resolveCategoryImage(category: Category): string | null {
  const remote = category.image_url?.trim();
  if (remote) return remote;
  return SLUG_THUMB[category.slug] ?? null;
}
