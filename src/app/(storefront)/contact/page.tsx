import type { Metadata } from "next";
import { getStoreSettingsAction } from "@/app/_actions/settings-actions";
import { ContactView } from "@/app/(storefront)/contact/_components/ContactView";
import { JsonLd } from "@/lib/seo/json-ld";
import { STORE_LOCATION, storeAddressLine } from "@/config/store-location";
import { absoluteUrl, languageAlternates } from "@/lib/seo/site-url";
import { getMessages } from "@/i18n/messages";
import { getRequestLocale } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const meta = getMessages(locale).meta;

  return {
    title: meta.contactTitle,
    description: meta.contactDescription,
    alternates: {
      canonical: absoluteUrl("/contact"),
      languages: languageAlternates("/contact"),
    },
    openGraph: {
      title: meta.contactTitle,
      description: meta.contactDescription,
      url: absoluteUrl("/contact"),
      type: "website",
    },
  };
}

export default async function ContactPage() {
  const locale = await getRequestLocale();
  const { data: settings } = await getStoreSettingsAction();
  const phone = settings?.receipt_store_phone?.trim() ?? "";

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "GroceryStore",
          name: STORE_LOCATION.name,
          email: STORE_LOCATION.email,
          telephone: phone || undefined,
          url: absoluteUrl("/contact"),
          address: {
            "@type": "PostalAddress",
            streetAddress: STORE_LOCATION.district[locale],
            addressLocality: STORE_LOCATION.city[locale],
            addressCountry: "OM",
          },
          geo: {
            "@type": "GeoCoordinates",
            latitude: STORE_LOCATION.coordinates.lat,
            longitude: STORE_LOCATION.coordinates.lng,
          },
          description: storeAddressLine(locale),
        }}
      />
      <ContactView phone={phone} />
    </>
  );
}
