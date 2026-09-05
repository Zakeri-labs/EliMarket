"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { Leaf, MapPin, Truck } from "lucide-react";
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

function InfoRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="py-4">
      <p className="text-xs text-text-secondary">{label}</p>
      <div className="mt-0.5 text-sm leading-6 text-text-primary">{children}</div>
    </div>
  );
}

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
    <main dir={dir} className="py-8 md:py-12">
      <header className="max-w-2xl border-b border-border-subtle pb-8">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-text-faint">
          {STORE_LOCATION.name}
        </p>
        <h1
          className={cn(
            "mt-3 text-3xl font-semibold tracking-tight text-text-primary md:text-4xl",
            locale === "en" && "font-logo",
          )}
        >
          {m.about.title}
        </h1>
        <p className="mt-2 text-sm text-text-secondary">{m.about.subtitle}</p>
        <p className="mt-4 text-sm leading-6 text-text-secondary">{m.about.story}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/categories">
            <Button size="md">{m.about.shopCta}</Button>
          </Link>
          <Link href="/contact">
            <Button variant="outline" size="md">
              {m.about.contactCta}
            </Button>
          </Link>
        </div>
      </header>

      <section className="grid gap-6 border-b border-border-subtle py-10 sm:grid-cols-3">
        {values.map((item) => (
          <div key={item.title} className="flex gap-3">
            <AppIcon icon={item.icon} size="sm" className="mt-0.5 shrink-0 text-accent-teal" />
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-text-primary">{item.title}</h2>
              <p className="mt-1 text-sm leading-6 text-text-secondary">{item.body}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="pt-10">
        <h2 className="text-base font-medium text-text-primary">{m.about.visitTitle}</h2>
        <p className="mt-1 text-sm text-text-secondary">{m.about.visitBody}</p>

        <div className="mt-6 grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="divide-y divide-border-subtle border-y border-border-subtle">
            <InfoRow label={m.contact.address}>
              <p className="font-medium">{STORE_LOCATION.name}</p>
              <p className="text-text-secondary">{addressLine}</p>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-block text-xs text-text-secondary hover:text-text-primary"
              >
                {m.blog.viewOnMaps}
              </a>
            </InfoRow>
            <InfoRow label={m.contact.workingHours}>
              <p>{m.contact.workingHoursValue}</p>
              <p className="text-text-secondary">{m.contact.fridayHours}</p>
            </InfoRow>
            <InfoRow label={m.home.deliverTo}>{STORE_LOCATION.deliveryArea[locale]}</InfoRow>
          </div>

          <div className="overflow-hidden rounded-xl">
            <StoreLocationMap className="h-64 lg:h-full" />
          </div>
        </div>
      </section>
    </main>
  );
}
