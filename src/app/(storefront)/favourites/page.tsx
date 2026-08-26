"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { AccountFavouritesPanel } from "@/app/(storefront)/account/_components/AccountFavouritesPanel";
import { StorefrontBreadcrumbs } from "@/app/(storefront)/_components/StorefrontBreadcrumbs";
import { AppIcon } from "@/components/icons/AppIcon";
import { useTranslations } from "@/i18n/use-translations";

export default function FavouritesPage() {
  const { t, dir } = useTranslations();

  return (
    <main className="w-full py-4 md:py-8" dir={dir}>
      <StorefrontBreadcrumbs
        items={[
          { label: t("product.breadcrumbHome"), href: "/" },
          { label: t("account.title"), href: "/account" },
          { label: t("account.favouritesTitle") },
        ]}
      />
      <Link
        href="/account?section=favourites"
        className="mb-4 inline-flex items-center gap-1 text-sm text-accent md:hidden"
      >
        <AppIcon icon={ChevronLeft} size="sm" className="rtl:rotate-180" />
        {t("account.title")}
      </Link>
      <AccountFavouritesPanel />
    </main>
  );
}
