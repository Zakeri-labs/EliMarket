/**
 * Where the physical store is. Single source of truth for the storefront's
 * location content (the blog seed posts, the footer address line, the AI
 * blog-draft prompt context).
 *
 * The coordinates and the Google Maps short link come from the store's real
 * pin. Keep prose here conservative — only things that are actually true of
 * the location — because it is fed verbatim into customer-facing copy.
 */
export const STORE_LOCATION = {
  /** The public shop name as shown on the storefront. */
  name: "Hills Eli Mart",
  /** Neighbourhood / district. */
  district: {
    fa: "المولح (سیب)",
    ar: "المعبيلة الجنوبية / المولح (السيب)",
    en: "Al Mawaleh, Seeb",
  },
  city: { fa: "مسقط", ar: "مسقط", en: "Muscat" },
  country: { fa: "عمان", ar: "عُمان", en: "Oman" },
  /** Exact pin. */
  coordinates: { lat: 23.576365, lng: 58.2986085 },
  /** The short link the store shares with customers. */
  googleMapsUrl: "https://maps.app.goo.gl/BwBXt5wQCj4sM5NH7",
  /** Delivery reach, in plain words, per locale (matches the storefront copy). */
  deliveryArea: {
    fa: "مسقط و سیب",
    ar: "مسقط والسيب",
    en: "Muscat and Seeb",
  },
} as const;

/** A universal `geo:` / maps deep link built from the exact pin. */
export function storeGeoUrl(): string {
  const { lat, lng } = STORE_LOCATION.coordinates;
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}

type LocaleKey = "fa" | "ar" | "en";

/** "District, City, Country" in the reading order and comma of the locale. */
export function storeAddressLine(locale: LocaleKey): string {
  const sep = locale === "en" ? ", " : "، ";
  return [
    STORE_LOCATION.district[locale],
    STORE_LOCATION.city[locale],
    STORE_LOCATION.country[locale],
  ].join(sep);
}
