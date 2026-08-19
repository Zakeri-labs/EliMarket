import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import CategoriesContent from "./CategoriesContent";
import { getMessages } from "@/i18n/messages";
import { getRequestLocale, serverT } from "@/i18n/server";
import { absoluteUrl, languageAlternates } from "@/lib/seo/site-url";

type Props = {
  searchParams: Promise<{ slug?: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const meta = getMessages(locale).meta;

  return {
    title: meta.storefrontTitle,
    description: meta.siteDescription,
    alternates: {
      canonical: absoluteUrl("/categories"),
      languages: languageAlternates("/categories"),
    },
    openGraph: {
      title: meta.storefrontTitle,
      description: meta.siteDescription,
      url: absoluteUrl("/categories"),
      type: "website",
    },
  };
}

async function CategoriesLoading() {
  const label = await serverT("common.loading");
  return <main className="px-4 py-8 text-muted">{label}</main>;
}

export default async function CategoriesPage({ searchParams }: Props) {
  const { slug } = await searchParams;
  if (slug) redirect(`/categories/${slug}`);

  return (
    <Suspense fallback={<CategoriesLoading />}>
      <CategoriesContent />
    </Suspense>
  );
}
