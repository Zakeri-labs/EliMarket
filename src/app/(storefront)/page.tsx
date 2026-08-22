import type { Metadata } from "next";
import { JsonLd } from "@/lib/seo/json-ld";
import { websiteJsonLd } from "@/lib/seo/schemas";
import { absoluteUrl, languageAlternates } from "@/lib/seo/site-url";
import { getMessages } from "@/i18n/messages";
import { getRequestLocale } from "@/i18n/server";
import { HomeView } from "@/app/(storefront)/_components/HomeView";
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
      <main>
        <CartDisabledNotice />
        <HomeView />
      </main>
    </>
  );
}
