"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { ArrowUp, ArrowUpRight, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
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
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-gold";

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
    "flex items-center gap-2.5 text-[13px] font-semibold text-text-primary",
    locale === "en" && "uppercase tracking-[0.16em]",
  );

  return (
    <footer className={cn("browser-only mt-16 border-t border-border-subtle bg-bg-card", className)}>
      <div aria-hidden className="h-px w-full bg-gradient-to-r from-transparent via-gold-hairline to-transparent" />

      <div
        className={cn(
          STOREFRONT_CONTAINER,
          "grid grid-cols-2 gap-x-6 gap-y-10 py-12 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)_minmax(0,0.7fr)_minmax(0,1.3fr)] lg:gap-x-12 lg:py-16",
        )}
      >
        <div className="col-span-2 lg:col-span-1">
          <Link href="/" dir="ltr" className={cn("inline-flex items-center gap-3 rounded-lg", FOCUS_RING)} aria-label="Hills Eli Mart">
            {/* eslint-disable-next-line @next/next/no-img-element -- fixed brand mark */}
            <img src="/logo-hills.png" alt="" width={640} height={619} className="h-14 w-auto shrink-0" />
            <span>
              <span className="font-logo block whitespace-nowrap text-xl font-medium uppercase leading-none tracking-[0.16em] text-text-primary">
                HILLS ELI MART
              </span>
              <span className="mt-2 block whitespace-nowrap text-[10px] uppercase leading-none tracking-[0.34em] text-text-secondary">
                GOOD FOOD&nbsp;&nbsp;BETTER LIVING
              </span>
            </span>
          </Link>
          <p className="mt-5 max-w-sm text-sm leading-7 text-text-secondary">{t("footer.tagline")}</p>
          <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-gold-wash-border bg-gold-wash-bg px-3.5 py-1.5 text-xs font-semibold text-text-primary">
            <span className="relative flex size-2" aria-hidden>
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent-gold opacity-60 motion-reduce:animate-none" />
              <span className="relative inline-flex size-2 rounded-full bg-accent-gold" />
            </span>
            {t("home.storeOpen24h")}
          </p>
        </div>

        <FooterLinkColumn title={t("footer.shop")} headingClass={headingClass} links={shopLinks} />
        <FooterLinkColumn title={t("footer.help")} headingClass={headingClass} links={helpLinks} />

        <div className="col-span-2 lg:col-span-1">
          <FooterHeading className={headingClass}>{t("footer.contact")}</FooterHeading>
          <ul className="mt-5 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-1">
            <ContactCard
              href={storeGeoUrl()}
              external
              icon={MapPin}
              label={storeAddressLine(locale)}
              value={
                <span className="inline-flex items-center gap-1 text-accent-gold">
                  {t("footer.mapsLink")}
                  <AppIcon icon={ArrowUpRight} size="xs" className="rtl:-scale-x-100" />
                </span>
              }
              plainValue
            />
            {phone ? (
              <>
                <ContactCard href={`tel:${digitsOnly(phone)}`} icon={Phone} label={t("contact.phone")} value={phone} />
                <ContactCard
                  href={`https://wa.me/${digitsOnly(phone)}`}
                  external
                  icon={MessageCircle}
                  label={t("contact.whatsapp")}
                  value={phone}
                />
              </>
            ) : null}
            <ContactCard
              href={`mailto:${STORE_LOCATION.email}`}
              icon={Mail}
              label={t("contact.email")}
              value={STORE_LOCATION.email}
            />
          </ul>
        </div>
      </div>

      <div className="border-t border-border-subtle">
        {/* Copyright centred; the back-to-top button sits at the end (below it on phones). */}
        <div
          className={cn(
            STOREFRONT_CONTAINER,
            "flex flex-col items-center gap-3 py-5 sm:grid sm:grid-cols-[1fr_auto_1fr] sm:gap-4",
          )}
        >
          <p className="text-center text-xs text-text-secondary sm:col-start-2">
            © {yearFormatter.format(new Date())} <span dir="ltr">{STORE_LOCATION.name}</span>. {t("footer.rights")}
          </p>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className={cn(
              "group inline-flex min-h-11 shrink-0 items-center sm:justify-self-end gap-2 rounded-full border border-border-subtle px-4 text-xs font-medium text-text-secondary transition-colors hover:border-gold-wash-border hover:text-text-primary lg:min-h-9",
              FOCUS_RING,
            )}
          >
            {t("footer.backToTop")}
            <AppIcon icon={ArrowUp} size="xs" className="text-accent-gold transition-transform group-hover:-translate-y-0.5" />
          </button>
        </div>
      </div>
    </footer>
  );
}

function FooterHeading({ className, children }: { className: string; children: ReactNode }) {
  return (
    <h2 className={className}>
      <span aria-hidden className="h-px w-5 bg-accent-gold" />
      {children}
    </h2>
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
      <FooterHeading className={headingClass}>{title}</FooterHeading>
      <ul className="mt-4 flex flex-col lg:gap-0.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className={cn(
                "inline-flex min-h-11 items-center rounded-sm text-sm text-text-secondary transition-colors hover:text-accent-gold lg:min-h-9",
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

function ContactCard({
  href,
  icon,
  label,
  value,
  external,
  plainValue,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  value: ReactNode;
  external?: boolean;
  /** `value` is not an LTR string (phone/email), so don't force its direction. */
  plainValue?: boolean;
}) {
  return (
    <li>
      <a
        href={href}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        className={cn(
          "flex h-full items-center gap-3 rounded-xl border border-border-subtle bg-bg-main px-3.5 py-3 transition-colors hover:border-gold-wash-border",
          FOCUS_RING,
        )}
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-gold-wash-border bg-gold-wash-bg text-accent-gold">
          <AppIcon icon={icon} size="sm" />
        </span>
        <span className="flex min-w-0 flex-col items-start gap-0.5">
          <span className="text-xs leading-5 text-text-secondary">{label}</span>
          <span
            {...(plainValue ? {} : { dir: "ltr" })}
            className="max-w-full truncate text-sm font-medium text-text-primary"
          >
            {value}
          </span>
        </span>
      </a>
    </li>
  );
}
