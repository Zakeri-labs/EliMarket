"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { useStoreSettings } from "@/app/_hooks/use-store-settings";
import { AppIcon } from "@/components/icons/AppIcon";
import { useTranslations } from "@/i18n/use-translations";

export function CartDisabledNotice() {
  const { showPrices } = useStoreSettings();
  const { t } = useTranslations();

  if (showPrices) return null;

  return (
    <div className="mb-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
      {t("store.cartDisabled")}
    </div>
  );
}

export function useCartEnabled() {
  const { showPrices, isLoading } = useStoreSettings();
  return { cartEnabled: showPrices, isLoading };
}

export function CartGate({ children }: { children: React.ReactNode }) {
  const { cartEnabled, isLoading } = useCartEnabled();
  const { t } = useTranslations();

  if (isLoading) {
    return <main className="py-8 text-center text-muted">{t("common.loading")}</main>;
  }

  if (!cartEnabled) {
    return (
      <main className="flex flex-col items-center justify-center py-16 text-center">
        <AppIcon icon={Lock} size="2xl" className="text-muted" />
        <h1 className="mt-4 text-lg font-bold">{t("store.cartClosedTitle")}</h1>
        <p className="mt-2 max-w-sm text-sm text-muted">{t("store.cartClosedDesc")}</p>
        <Link href="/" className="mt-6 text-accent text-sm">{t("nav.home")}</Link>
      </main>
    );
  }

  return children;
}
