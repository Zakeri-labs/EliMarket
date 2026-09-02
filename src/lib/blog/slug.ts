import { slugifyProductName } from "@/lib/products/slug";

/** Latin, url-safe slug for a blog post; falls back to a timestamp id. */
export function slugifyBlogTitle(value: string) {
  const slug = slugifyProductName(value);
  return slug.startsWith("product-") ? `post-${Date.now().toString(36)}` : slug;
}
