import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getCategoriesAction } from "@/app/_actions/product-actions";
import { CategoryProductList } from "@/app/(storefront)/_components/CategoryProductList";
import { AppIcon } from "@/components/icons/AppIcon";
import { JsonLd } from "@/lib/seo/json-ld";
import { categoryBreadcrumbJsonLd } from "@/lib/seo/schemas";
import {
  absoluteUrl,
  languageAlternates,
  trimDescription,
} from "@/lib/seo/site-url";
import { getMessages } from "@/i18n/messages";
import { getRequestLocale, serverT } from "@/i18n/server";

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

  const description = meta.categoryDescription.replace("{name}", category.name);
  const path = `/categories/${slug}`;

  return {
    title: category.name,
    description: trimDescription(description),
    alternates: {
      canonical: absoluteUrl(path),
      languages: languageAlternates(path),
    },
    openGraph: {
      title: category.name,
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

  const backLabel = await serverT("categories.back");

  return (
    <>
      <JsonLd data={categoryBreadcrumbJsonLd(category)} />
      <main className="py-4 md:py-6">
        <div className="mb-4 flex items-center gap-2">
          <Link
            href="/categories"
            className="inline-flex items-center gap-1 text-sm text-accent"
          >
            <AppIcon icon={ChevronLeft} size="sm" className="rtl:rotate-180" />
            {backLabel}
          </Link>
          <h1 className="font-bold">{category.name}</h1>
        </div>
        <CategoryProductList slug={slug} />
      </main>
    </>
  );
}
