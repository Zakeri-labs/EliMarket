"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { cn } from "@/app/utils/cn";
import { STOREFRONT_CONTAINER } from "@/config/layout";
import { STORE_LOCATION, storeAddressLine, storeGeoUrl } from "@/config/store-location";
import { AppIcon } from "@/components/icons/AppIcon";
import { useTranslations } from "@/i18n/use-translations";

/** Store-local year (Muscat), so server (UTC) and client agree around New Year. */
const yearFormatter = new Intl.DateTimeFormat("en", { timeZone: "Asia/Muscat", year: "numeric" });

function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

type FooterLink = { href: string; label: string };

const FOCUS_RING =
  "rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-gold";

/**
 * Site footer. Browser only — `browser-only` hides it when the storefront runs
 * as the installed app (PWA display modes), where the bottom nav is the chrome.
 */
export function StorefrontFooter({
  storePhone,
  className,
}: {
  storePhone: string | null;
  className?: string;
}) {
  const { t, locale } = useTranslations();
  const phone = storePhone?.trim() ?? "";

  const shopLinks: FooterLink[] = [
    { href: "/", label: t("nav.home") },
    { href: "/categories", label: t("nav.categories") },
    { href: "/offers", label: t("nav.offers") },
    { href: "/blog", label: t("nav.blog") },
  ];
  const helpLinks: FooterLink[] = [
    { href: "/about", label: t("nav.about") },
    { href: "/contact", label: t("nav.contact") },
    { href: "/orders", label: t("nav.trackOrder") },
    { href: "/account", label: t("nav.account") },
  ];

  const headingClass = cn(
    "text-xs font-semibold text-text-primary",
    locale === "en" && "uppercase tracking-[0.18em]",
  );

  return (
    <footer
      className={cn(
        "browser-only mt-12 bg-bg-main",
        className,
      )}
    >
      <div aria-hidden className="h-px w-full bg-gradient-to-r from-transparent via-gold-hairline to-transparent" />

      <div
        className={cn(
          STOREFRONT_CONTAINER,
          "grid grid-cols-2 gap-x-6 gap-y-10 py-10 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))] lg:gap-12 lg:py-14",
        )}
      >
        <div className="col-span-2 lg:col-span-1">
          <Link href="/" dir="ltr" className={cn("inline-flex items-center gap-3", FOCUS_RING)} aria-label="Hills Eli Mart">
            {/* eslint-disable-next-line @next/next/no-img-element -- fixed brand mark */}
            <img src="/logo-hills.png" alt="" width={640} height={619} className="h-12 w-auto shrink-0" />
            <span>
              <span className="font-logo block whitespace-nowrap text-lg font-medium uppercase leading-none tracking-[0.16em] text-text-primary">
                HILLS ELI MART
              </span>
              <span className="mt-1.5 block whitespace-nowrap text-[10px] uppercase leading-none tracking-[0.34em] text-text-secondary">
                GOOD FOOD&nbsp;&nbsp;BETTER LIVING
              </span>
            </span>
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-6 text-text-secondary">{t("footer.tagline")}</p>
        </div>

        <FooterLinkColumn title={t("footer.shop")} headingClass={headingClass} links={shopLinks} />
        <FooterLinkColumn title={t("footer.help")} headingClass={headingClass} links={helpLinks} />

        <div className="col-span-2 lg:col-span-1">
          <h2 className={headingClass}>{t("footer.contact")}</h2>
          <ul className="mt-4 flex flex-col gap-2 text-sm text-text-secondary lg:gap-3">
            <li>
              <a
                href={storeGeoUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className={cn("group flex min-h-11 items-start lg:min-h-8 gap-2.5 transition-colors hover:text-text-primary", FOCUS_RING)}
              >
                <AppIcon icon={MapPin} size="sm" className="mt-0.5 shrink-0 text-accent-gold" />
                <span>
                  {storeAddressLine(locale)}
                  <span className="mt-0.5 block text-xs font-medium text-accent-teal underline-offset-4 group-hover:underline">
                    {t("blog.viewOnMaps")}
                  </span>
                </span>
              </a>
            </li>
            {phone ? (
              <>
                <ContactRow href={`tel:${digitsOnly(phone)}`} icon={Phone} label={t("contact.phone")} value={phone} />
                <ContactRow
                  href={`https://wa.me/${digitsOnly(phone)}`}
                  external
                  icon={MessageCircle}
                  label={t("contact.whatsapp")}
                  value={phone}
                />
              </>
            ) : null}
            <ContactRow
              href={`mailto:${STORE_LOCATION.email}`}
              icon={Mail}
              label={t("contact.email")}
              value={STORE_LOCATION.email}
            />
          </ul>
        </div>
      </div>

      <div className="border-t border-border-subtle">
        <p className={cn(STOREFRONT_CONTAINER, "py-5 text-xs text-text-secondary")}>
          © {yearFormatter.format(new Date())} <span dir="ltr">{STORE_LOCATION.name}</span>. {t("footer.rights")}
        </p>
      </div>
    </footer>
  );
}

function FooterLinkColumn({
  title,
  headingClass,
  links,
}: {
  title: string;
  headingClass: string;
  links: FooterLink[];
}) {
  return (
    <nav aria-label={title}>
      <h2 className={headingClass}>{title}</h2>
      <ul className="mt-3 flex flex-col lg:gap-1">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className={cn(
                "inline-flex min-h-11 items-center text-sm lg:min-h-8 text-text-secondary transition-colors hover:text-text-primary",
                FOCUS_RING,
              )}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function ContactRow({
  href,
  icon,
  label,
  value,
  external,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  value: string;
  external?: boolean;
}) {
  return (
    <li>
      <a
        href={href}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        className={cn("flex min-h-11 items-start gap-2.5 lg:min-h-8 transition-colors hover:text-text-primary", FOCUS_RING)}
      >
        <AppIcon icon={icon} size="sm" className="mt-0.5 shrink-0 text-accent-gold" />
        <span className="flex flex-col items-start">
          <span className="text-[11px] text-text-dim">{label}</span>
          <span dir="ltr">{value}</span>
        </span>
      </a>
    </li>
  );
}
