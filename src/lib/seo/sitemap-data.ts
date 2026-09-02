import { createClient } from "@/core/supabase/server";
import type { BlogPost, Category, Product } from "@/app/_types/database.types";

export async function getSitemapProducts(): Promise<
  Pick<Product, "slug" | "created_at">[]
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("slug, created_at")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("sitemap: failed to load products", error.message);
    return [];
  }

  return data ?? [];
}

export async function getSitemapCategories(): Promise<
  Pick<Category, "slug" | "created_at">[]
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("slug, created_at")
    .order("sort_order");

  if (error) {
    console.error("sitemap: failed to load categories", error.message);
    return [];
  }

  return data ?? [];
}

export async function getSitemapBlogPosts(): Promise<
  Pick<BlogPost, "slug" | "updated_at">[]
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("slug, updated_at")
    .eq("published", true)
    .order("published_at", { ascending: false });

  if (error) {
    console.error("sitemap: failed to load blog posts", error.message);
    return [];
  }

  return data ?? [];
}
