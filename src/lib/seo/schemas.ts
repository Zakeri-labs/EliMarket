import { BRAND_NAME } from "@/config/brand";
import type { BlogPost, Category, Product } from "@/app/_types/database.types";
import { productGallery } from "@/lib/products/gallery";
import { absoluteUrl, getSiteUrl, trimDescription } from "@/lib/seo/site-url";
import { resolveProductDescription } from "@/lib/i18n/product-description";
import { resolveProductName } from "@/lib/i18n/product-name";
import { resolveCategoryName } from "@/lib/i18n/category-name";
import {
  resolveBlogBody,
  resolveBlogExcerpt,
  resolveBlogTitle,
} from "@/lib/i18n/blog-post";
import { DEFAULT_LOCALE, type Locale } from "@/i18n/config";

export function websiteJsonLd() {
  const siteUrl = getSiteUrl();

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: BRAND_NAME,
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${siteUrl}/search?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: BRAND_NAME,
        url: siteUrl,
        logo: absoluteUrl("/icon.png"),
      },
    ],
  };
}

export function productJsonLd(
  product: Product,
  locale: Locale = DEFAULT_LOCALE,
  reviewStats?: { average: number; count: number },
) {
  const availability =
    product.stock > 0
      ? "https://schema.org/InStock"
      : "https://schema.org/OutOfStock";

  const galleryImages = productGallery(product).map((image) => image.image_url);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: resolveProductName(product, locale),
    description: resolveProductDescription(product, locale) ?? undefined,
    image: galleryImages.length ? galleryImages : undefined,
    sku: product.sku ?? product.id,
    aggregateRating:
      reviewStats && reviewStats.count > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: reviewStats.average,
            reviewCount: reviewStats.count,
          }
        : undefined,
    offers: {
      "@type": "Offer",
      url: absoluteUrl(`/products/${product.slug}`),
      priceCurrency: product.currency,
      price: product.price,
      availability,
    },
  };
}

export function categoryBreadcrumbJsonLd(category: Category, locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: absoluteUrl("/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Categories",
        item: absoluteUrl("/categories"),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: resolveCategoryName(category, locale),
        item: absoluteUrl(`/categories/${category.slug}`),
      },
    ],
  };
}

export function blogListJsonLd(posts: BlogPost[], locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${getSiteUrl()}/blog#blog`,
    url: absoluteUrl("/blog"),
    name: BRAND_NAME,
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      headline: resolveBlogTitle(post, locale),
      url: absoluteUrl(`/blog/${post.slug}`),
      datePublished: post.published_at,
      dateModified: post.updated_at,
    })),
  };
}

export function blogPostingJsonLd(post: BlogPost, locale: Locale) {
  const url = absoluteUrl(`/blog/${post.slug}`);
  const description =
    trimDescription(resolveBlogExcerpt(post, locale)) ||
    trimDescription(resolveBlogBody(post, locale).replace(/^##\s.*$/gm, ""));

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    headline: resolveBlogTitle(post, locale),
    description: description || undefined,
    image: post.cover_url ?? undefined,
    datePublished: post.published_at,
    dateModified: post.updated_at,
    author: { "@type": "Organization", name: BRAND_NAME },
    publisher: {
      "@type": "Organization",
      name: BRAND_NAME,
      logo: { "@type": "ImageObject", url: absoluteUrl("/icon.png") },
    },
  };
}

export function blogBreadcrumbJsonLd(post: BlogPost, locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Blog", item: absoluteUrl("/blog") },
      {
        "@type": "ListItem",
        position: 3,
        name: resolveBlogTitle(post, locale),
        item: absoluteUrl(`/blog/${post.slug}`),
      },
    ],
  };
}
