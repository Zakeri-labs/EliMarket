import type { Metadata } from "next";
import { OffersView } from "@/app/(storefront)/offers/_components/OffersView";
import { absoluteUrl, languageAlternates } from "@/lib/seo/site-url";
import { getMessages } from "@/i18n/messages";
import { getRequestLocale } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const meta = getMessages(locale).meta;

  return {
    title: meta.offersTitle,
    description: meta.offersDescription,
    alternates: {
      canonical: absoluteUrl("/offers"),
      languages: languageAlternates("/offers"),
    },
    openGraph: {
      title: meta.offersTitle,
      description: meta.offersDescription,
      url: absoluteUrl("/offers"),
      type: "website",
    },
  };
}

export default function OffersPage() {
  return <OffersView />;
}
