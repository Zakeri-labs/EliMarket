import type { MetadataRoute } from "next";
import {
  getSitemapBlogPosts,
  getSitemapCategories,
  getSitemapProducts,
} from "@/lib/seo/sitemap-data";
import { absoluteUrl } from "@/lib/seo/site-url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories, blogPosts] = await Promise.all([
    getSitemapProducts(),
    getSitemapCategories(),
    getSitemapBlogPosts(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: absoluteUrl("/categories"),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/search"),
      changeFrequency: "weekly",
      priority: 0.5,
    },
    {
      url: absoluteUrl("/blog"),
      changeFrequency: "weekly",
      priority: 0.6,
    },
  ];

  const blogRoutes: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: absoluteUrl(`/blog/${post.slug}`),
    lastModified: post.updated_at,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((category) => ({
    url: absoluteUrl(`/categories/${category.slug}`),
    lastModified: category.created_at,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: absoluteUrl(`/products/${product.slug}`),
    lastModified: product.created_at,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...blogRoutes, ...categoryRoutes, ...productRoutes];
}
