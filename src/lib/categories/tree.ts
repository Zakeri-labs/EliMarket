import type { Category } from "@/app/_types/database.types";

export function topLevelCategories(categories: Category[]) {
  return categories.filter((category) => !category.parent_id);
}

export function childCategories(categories: Category[], parentId: string) {
  return categories.filter((category) => category.parent_id === parentId);
}

export function parentCategory(categories: Category[], category: Category) {
  if (!category.parent_id) return null;
  return categories.find((item) => item.id === category.parent_id) ?? null;
}

export function categoryAndDescendantSlugs(
  categories: Category[],
  slug: string,
): string[] {
  const category = categories.find((item) => item.slug === slug);
  if (!category) return [slug];
  const children = childCategories(categories, category.id);
  return [category.slug, ...children.map((item) => item.slug)];
}
