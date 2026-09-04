"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { Clock, Leaf, MapPin, Truck } from "lucide-react";
import { cn } from "@/app/utils/cn";
import { AppIcon } from "@/components/icons/AppIcon";
import { Button } from "@/components/ui/Button";
import { STORE_LOCATION, storeAddressLine, storeGeoUrl } from "@/config/store-location";
import { useTranslations } from "@/i18n/use-translations";
import "leaflet/dist/leaflet.css";

const StoreLocationMap = dynamic(
  () => import("@/app/(storefront)/contact/_components/StoreLocationMap"),
  { ssr: false },
);

export function AboutView() {
  const { messages: m, locale, dir } = useTranslations();
  const addressLine = storeAddressLine(locale);
  const mapsUrl = storeGeoUrl();

  const values = [
    { icon: Leaf, title: m.about.valuesFresh, body: m.about.valuesFreshDesc },
    { icon: Truck, title: m.about.valuesDelivery, body: m.about.valuesDeliveryDesc },
    { icon: MapPin, title: m.about.valuesLocal, body: m.about.valuesLocalDesc },
  ] as const;

  return (
    <main dir={dir} className="py-6 md:py-10">
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.8fr)] lg:items-stretch">
        <div className="flex flex-col justify-center rounded-3xl border border-border-subtle bg-bg-card px-5 py-8 sm:px-10 sm:py-12">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-teal">
            {STORE_LOCATION.name}
          </p>
          <h1
            className={cn(
              "mt-3 max-w-xl text-3xl font-bold tracking-tight text-text-primary sm:text-4xl lg:text-[2.75rem] lg:leading-tight",
              locale === "en" && "font-logo",
            )}
          >
            {m.about.title}
          </h1>
          <p className="mt-3 text-base text-text-secondary">{m.about.subtitle}</p>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-text-secondary sm:text-[15px]">
            {m.about.story}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/categories">
              <Button size="lg">{m.about.shopCta}</Button>
            </Link>
            <Link href="/contact">
              <Button variant="secondary" size="lg">
                {m.about.contactCta}
              </Button>
            </Link>
          </div>
        </div>

        <aside className="flex flex-col justify-between gap-5 rounded-3xl border border-border-subtle bg-bg-card p-6 sm:p-7">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
              {m.contact.address}
            </p>
            <p className="mt-2 text-base font-semibold leading-6 text-text-primary">
              {STORE_LOCATION.name}
            </p>
            <p className="mt-1 text-sm leading-6 text-text-secondary">{addressLine}</p>
          </div>
          <div className="border-t border-border-subtle pt-5">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-text-secondary">
              <AppIcon icon={Clock} size="xs" className="text-accent-gold" />
              {m.contact.workingHours}
            </p>
            <p className="mt-2 text-sm font-medium leading-6 text-text-primary">
              {m.contact.workingHoursValue}
            </p>
            <p className="text-sm text-text-secondary">{m.contact.fridayHours}</p>
          </div>
          <div className="border-t border-border-subtle pt-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
              {m.home.deliverTo}
            </p>
            <p className="mt-2 text-sm font-medium text-text-primary">
              {STORE_LOCATION.deliveryArea[locale]}
            </p>
          </div>
        </aside>
      </section>

      <ul className="mt-6 grid gap-4 sm:grid-cols-3">
        {values.map((item) => (
          <li
            key={item.title}
            className="rounded-2xl border border-border-subtle bg-bg-card p-5 sm:p-6"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-teal/15 text-accent-teal">
              <AppIcon icon={item.icon} size="md" />
            </span>
            <h2 className="mt-4 text-base font-semibold text-text-primary">{item.title}</h2>
            <p className="mt-2 text-sm leading-6 text-text-secondary">{item.body}</p>
          </li>
        ))}
      </ul>

      <section className="mt-6 overflow-hidden rounded-3xl border border-border-subtle bg-bg-card">
        <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-end sm:justify-between sm:px-7">
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-text-primary">{m.about.visitTitle}</h2>
            <p className="mt-1 max-w-xl text-sm leading-6 text-text-secondary">
              {m.about.visitBody}
            </p>
          </div>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-accent-teal px-4 py-2 text-xs font-bold text-on-accent"
          >
            <AppIcon icon={MapPin} size="xs" />
            {m.blog.viewOnMaps}
          </a>
        </div>
        <StoreLocationMap />
      </section>
    </main>
  );
}
