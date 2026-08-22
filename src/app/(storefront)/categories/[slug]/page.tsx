import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoriesAction } from "@/app/_actions/product-actions";
import { CategoryBrowse } from "@/app/(storefront)/_components/CategoryBrowse";
import { JsonLd } from "@/lib/seo/json-ld";
import { categoryBreadcrumbJsonLd } from "@/lib/seo/schemas";
import {
  absoluteUrl,
  languageAlternates,
  trimDescription,
} from "@/lib/seo/site-url";
import { getMessages } from "@/i18n/messages";
import { getRequestLocale } from "@/i18n/server";
import { resolveCategoryName } from "@/lib/i18n/category-name";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getRequestLocale();
  const meta = getMessages(locale).meta;
  const categoriesResult = await getCategoriesAction();
  const category = categoriesResult.success
    ? categoriesResult.data.find((c) => c.slug === slug)
    : undefined;

  if (!category) {
    return { title: meta.storefrontTitle };
  }

  const categoryName = resolveCategoryName(category, locale);
  const description = meta.categoryDescription.replace("{name}", categoryName);
  const path = `/categories/${slug}`;

  return {
    title: categoryName,
    description: trimDescription(description),
    alternates: {
      canonical: absoluteUrl(path),
      languages: languageAlternates(path),
    },
    openGraph: {
      title: categoryName,
      description: trimDescription(description),
      url: absoluteUrl(path),
      type: "website",
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const categoriesResult = await getCategoriesAction();

  if (!categoriesResult.success) notFound();

  const category = categoriesResult.data.find((c) => c.slug === slug);
  if (!category) notFound();

  const locale = await getRequestLocale();

  return (
    <>
      <JsonLd data={categoryBreadcrumbJsonLd(category, locale)} />
      <CategoryBrowse slug={slug} />
    </>
  );
}
