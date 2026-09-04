"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";
import { cn } from "@/app/utils/cn";
import { STOREFRONT_CONTAINER } from "@/config/layout";
import { storeAddressLine, storeGeoUrl } from "@/config/store-location";
import { AppIcon } from "@/components/icons/AppIcon";
import { useTranslations } from "@/i18n/use-translations";

export function StorefrontFooter() {
  const { t, messages, locale } = useTranslations();

  const links = [
    { href: "/", label: t("nav.home") },
    { href: "/categories", label: t("nav.categories") },
    { href: "/about", label: t("nav.about") },
    { href: "/offers", label: t("nav.offers") },
    { href: "/blog", label: t("nav.blog") },
    { href: "/contact", label: t("nav.contact") },
    { href: "/orders", label: t("nav.trackOrder") },
    { href: "/account", label: t("nav.account") },
  ];

  const addressLine = storeAddressLine(locale);

  return (
    <footer className="mt-10 border-t border-border-subtle bg-bg-main">
      <div
        className={cn(
          STOREFRONT_CONTAINER,
          "flex flex-col gap-6 py-8 md:flex-row md:items-start md:justify-between",
        )}
      >
        <div className="max-w-sm">
          <p
            className={cn(
              "text-base tracking-wide text-text-primary",
              locale !== "ar" && "font-logo",
            )}
          >
            {messages.brand.nameLocal}
          </p>
          <p className="mt-2 flex items-start gap-1.5 text-sm text-text-secondary">
            <AppIcon icon={MapPin} size="xs" className="mt-0.5 shrink-0" />
            <span>{addressLine}</span>
          </p>
          <a
            href={storeGeoUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-sm font-medium text-accent-teal"
          >
            {t("blog.viewOnMaps")}
          </a>
        </div>

        <nav className="grid grid-cols-2 gap-x-10 gap-y-2 sm:flex sm:flex-col">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-text-secondary transition-colors hover:text-text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className={cn(STOREFRONT_CONTAINER, "border-t border-border-subtle py-4")}>
        <p className="text-xs text-text-secondary">
          © {new Date().getFullYear()} {messages.brand.name}
        </p>
      </div>
    </footer>
  );
}
