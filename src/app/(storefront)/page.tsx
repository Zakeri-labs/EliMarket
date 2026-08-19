import type { Metadata } from "next";
import { JsonLd } from "@/lib/seo/json-ld";
import { websiteJsonLd } from "@/lib/seo/schemas";
import { absoluteUrl, languageAlternates } from "@/lib/seo/site-url";
import { getMessages } from "@/i18n/messages";
import { getRequestLocale } from "@/i18n/server";
import { CategoryGrid } from "@/app/(storefront)/_components/CategoryGrid";
import { FlashDeals } from "@/app/(storefront)/_components/FlashDeals";
import { HeroCarousel } from "@/app/(storefront)/_components/HeroCarousel";
import { LocationBar, SearchBar } from "@/app/(storefront)/_components/HomeSections";
import { ProductGrid } from "@/app/(storefront)/_components/ProductGrid";
import { CartDisabledNotice } from "@/app/(storefront)/_components/CartGate";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const meta = getMessages(locale).meta;

  return {
    title: meta.homeTitle,
    description: meta.homeOgDescription,
    alternates: {
      canonical: absoluteUrl("/"),
      languages: languageAlternates("/"),
    },
    openGraph: {
      title: meta.homeTitle,
      description: meta.homeOgDescription,
      url: absoluteUrl("/"),
      type: "website",
    },
  };
}

export default function StorefrontHomePage() {
  return (
    <>
      <JsonLd data={websiteJsonLd()} />
      <main className="space-y-6 py-4 md:space-y-8 md:py-6">
        <CartDisabledNotice />
        <div className="space-y-3">
          <LocationBar />
          <SearchBar />
        </div>
        <HeroCarousel />
        <CategoryGrid />
        <FlashDeals />
        <ProductGrid />
      </main>
    </>
  );
}
