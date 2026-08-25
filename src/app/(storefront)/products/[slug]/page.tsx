import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/core/supabase/auth-helpers";
import { getProductBySlugAction } from "@/app/_actions/product-actions";
import { getProductReviewsAction } from "@/app/_actions/review-actions";
import { ProductDetailPageClient } from "@/app/(storefront)/_components/ProductDetailPageClient";
import { JsonLd } from "@/lib/seo/json-ld";
import { productJsonLd } from "@/lib/seo/schemas";
import {
  absoluteUrl,
  languageAlternates,
  trimDescription,
} from "@/lib/seo/site-url";
import { getMessages } from "@/i18n/messages";
import { getRequestLocale } from "@/i18n/server";
import { resolveProductDescription } from "@/lib/i18n/product-description";
import { productGallery } from "@/lib/products/gallery";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getRequestLocale();
  const meta = getMessages(locale).meta;
  const result = await getProductBySlugAction(slug);

  if (!result.success) {
    return { title: meta.productFallback };
  }

  const product = result.data;
  const description = trimDescription(resolveProductDescription(product, locale));
  const path = `/products/${slug}`;
  const images = productGallery(product).map((image) => ({
    url: image.image_url,
    alt: product.name,
  }));

  return {
    title: product.name,
    description: description || undefined,
    alternates: {
      canonical: absoluteUrl(path),
      languages: languageAlternates(path),
    },
    openGraph: {
      title: product.name,
      description: description || undefined,
      url: absoluteUrl(path),
      type: "website",
      images: images.length ? images : undefined,
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/account?next=${encodeURIComponent(`/products/${slug}`)}`);
  }

  const locale = await getRequestLocale();
  const result = await getProductBySlugAction(slug);
  if (!result.success || !result.data) notFound();

  const reviewsResult = await getProductReviewsAction(result.data.id);
  const reviewStats = reviewsResult.success
    ? { average: reviewsResult.data.average, count: reviewsResult.data.count }
    : undefined;

  return (
    <>
      <JsonLd data={productJsonLd(result.data, locale, reviewStats)} />
      <ProductDetailPageClient slug={slug} initialProduct={result.data} />
    </>
  );
}
