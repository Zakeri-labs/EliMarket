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

/** Brand category artwork (cut from the approved design) — wins over any DB image. */
const MOCK_THUMB: Record<string, string> = {
  produce: "/categories/mock/produce.png",
  dairy: "/categories/mock/dairy.png",
  meat: "/categories/mock/meat.png",
  bakery: "/categories/mock/bakery.png",
  beverages: "/categories/mock/beverages.png",
  snacks: "/categories/mock/snacks.png",
  pantry: "/categories/mock/pantry.png",
  "personal-care": "/categories/mock/personal-care.png",
  household: "/categories/mock/household.png",
  "baby-care": "/categories/mock/baby-care.png",
  babycare: "/categories/mock/baby-care.png",
  spices: "/categories/mock/spices.png",
  spice: "/categories/mock/spices.png",
};

export function resolveCategoryImage(category: Category): string | null {
  // Admin-entered slugs may differ in case (e.g. "Spice").
  const slug = category.slug.trim().toLowerCase();
  const brand = MOCK_THUMB[slug];
  if (brand) return brand;
  const remote = category.image_url?.trim();
  if (remote) return remote;
  return SLUG_THUMB[slug] ?? null;
}
