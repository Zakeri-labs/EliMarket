import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlugAction } from "@/app/_actions/product-actions";
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
  const description = trimDescription(product.description);
  const path = `/products/${slug}`;
  const images = product.image_url
    ? [{ url: product.image_url, alt: product.name }]
    : undefined;

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
      images,
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const result = await getProductBySlugAction(slug);
  if (!result.success || !result.data) notFound();

  return (
    <>
      <JsonLd data={productJsonLd(result.data)} />
      <ProductDetailPageClient slug={slug} initialProduct={result.data} />
    </>
  );
}
