"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { AccountAddressesPanel } from "@/app/(storefront)/account/_components/AccountAddressesPanel";
import { useAuthStore } from "@/app/_store/auth-store";
import { AppIcon } from "@/components/icons/AppIcon";
import { StorefrontBreadcrumbs } from "@/app/(storefront)/_components/StorefrontBreadcrumbs";
import { useTranslations } from "@/i18n/use-translations";

export default function AddressesPage() {
  const { status } = useAuthStore();
  const { t, dir } = useTranslations();

  if (status === "loading") return null;

  if (status !== "authenticated") {
    return (
      <main className="w-full py-4 md:py-8" dir={dir}>
        <StorefrontBreadcrumbs
          items={[
            { label: t("product.breadcrumbHome"), href: "/" },
            { label: t("account.addressesTitle") },
          ]}
        />
        <h1 className="mb-2 text-xl font-bold">{t("account.addressesTitle")}</h1>
        <p className="mb-4 text-sm text-muted">{t("account.loginSubtitle")}</p>
        <Link href="/account" className="text-sm font-medium text-accent">
          {t("account.loginTitle")}
        </Link>
      </main>
    );
  }

  return (
    <main className="w-full py-4 md:py-8" dir={dir}>
      <StorefrontBreadcrumbs
        items={[
          { label: t("product.breadcrumbHome"), href: "/" },
          { label: t("account.title"), href: "/account" },
          { label: t("account.addressesTitle") },
        ]}
      />
      <Link
        href="/account?section=addresses"
        className="mb-4 inline-flex items-center gap-1 text-sm text-accent md:hidden"
      >
        <AppIcon icon={ChevronLeft} size="sm" className="rtl:rotate-180" />
        {t("account.title")}
      </Link>
      <AccountAddressesPanel />
    </main>
  );
}
