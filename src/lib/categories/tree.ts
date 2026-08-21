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
  return [category.slug, ...categoryDescendantIds(categories, category.id)
    .map((id) => categories.find((item) => item.id === id)?.slug)
    .filter((item): item is string => Boolean(item))];
}

export function categoryDescendantIds(categories: Category[], id: string): string[] {
  const ids: string[] = [];
  const walk = (parentId: string) => {
    for (const child of childCategories(categories, parentId)) {
      ids.push(child.id);
      walk(child.id);
    }
  };
  walk(id);
  return ids;
}

export function categoryDepth(categories: Category[], category: Category): number {
  let depth = 0;
  let current: Category | null = category;
  const seen = new Set<string>();
  while (current?.parent_id && !seen.has(current.id)) {
    seen.add(current.id);
    current = parentCategory(categories, current);
    if (!current) break;
    depth += 1;
  }
  return depth;
}

export function flattenCategoryTree(categories: Category[]): Category[] {
  const result: Category[] = [];
  const walk = (parentId: string | null) => {
    const nodes = categories
      .filter((category) => (category.parent_id ?? null) === parentId)
      .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name));
    for (const node of nodes) {
      result.push(node);
      walk(node.id);
    }
  };
  walk(null);
  return result;
}

export function validCategoryParents(
  categories: Category[],
  selfId?: string,
): Category[] {
  const blocked = new Set<string>(selfId ? [selfId, ...categoryDescendantIds(categories, selfId)] : []);
  return flattenCategoryTree(categories).filter((category) => !blocked.has(category.id));
}
