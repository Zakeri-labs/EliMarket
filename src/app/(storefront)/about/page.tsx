import type { Metadata } from "next";
import { AboutView } from "@/app/(storefront)/about/_components/AboutView";
import { JsonLd } from "@/lib/seo/json-ld";
import { STORE_LOCATION, storeAddressLine } from "@/config/store-location";
import { absoluteUrl, languageAlternates } from "@/lib/seo/site-url";
import { getMessages } from "@/i18n/messages";
import { getRequestLocale } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const meta = getMessages(locale).meta;

  return {
    title: meta.aboutTitle,
    description: meta.aboutDescription,
    alternates: {
      canonical: absoluteUrl("/about"),
      languages: languageAlternates("/about"),
    },
    openGraph: {
      title: meta.aboutTitle,
      description: meta.aboutDescription,
      url: absoluteUrl("/about"),
      type: "website",
    },
  };
}

export default async function AboutPage() {
  const locale = await getRequestLocale();

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: STORE_LOCATION.name,
          url: absoluteUrl("/about"),
          description: storeAddressLine(locale),
        }}
      />
      <AboutView />
    </>
  );
}
