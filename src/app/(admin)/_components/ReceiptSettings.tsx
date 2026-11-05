"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { updateReceiptSettingsAction } from "@/app/_actions/settings-actions";
import { useStoreSettings } from "@/app/_hooks/use-store-settings";
import { useFormAction } from "@/app/hooks/use-form-action";
import { cn } from "@/app/utils/cn";
import { Button } from "@/components/ui/Button";
import { LOCALES, LOCALE_LABELS, type Locale } from "@/i18n/config";
import { useTranslations } from "@/i18n/use-translations";

type LangText = Record<Locale, string>;

type Props = {
  className?: string;
};

export function ReceiptSettings({ className }: Props) {
  const { hero: settings, isReady } = useStoreSettings();
  const isLoading = !isReady;
  const { runAction, isPending } = useFormAction();
  const queryClient = useQueryClient();
  const { t, locale } = useTranslations();

  const [langTab, setLangTab] = useState<Locale>(locale);
  // `null` = show the persisted value; an object = the admin is editing.
  const [draft, setDraft] = useState<{
    name: LangText;
    address: LangText;
    footer: LangText;
    phone: string;
  } | null>(null);

  const persisted = {
    name: {
      fa: settings.receipt_store_name_fa ?? "",
      ar: settings.receipt_store_name_ar ?? "",
      en: settings.receipt_store_name_en ?? "",
    },
    address: {
      fa: settings.receipt_store_address_fa ?? "",
      ar: settings.receipt_store_address_ar ?? "",
      en: settings.receipt_store_address_en ?? "",
    },
    footer: {
      fa: settings.receipt_footer_fa ?? "",
      ar: settings.receipt_footer_ar ?? "",
      en: settings.receipt_footer_en ?? "",
    },
    phone: settings.receipt_store_phone ?? "",
  };

  const value = draft ?? { ...persisted, name: { ...persisted.name }, address: { ...persisted.address }, footer: { ...persisted.footer } };

  const patch = (
    field: "name" | "address" | "footer",
    loc: Locale,
    text: string,
  ) =>
    setDraft((prev) => {
      const base = prev ?? {
        name: { ...persisted.name },
        address: { ...persisted.address },
        footer: { ...persisted.footer },
        phone: persisted.phone,
      };
      return { ...base, [field]: { ...base[field], [loc]: text } };
    });

  const save = () => {
    runAction(
      () =>
        updateReceiptSettingsAction({
          receipt_store_name_fa: value.name.fa,
          receipt_store_name_ar: value.name.ar,
          receipt_store_name_en: value.name.en,
          receipt_store_address_fa: value.address.fa,
          receipt_store_address_ar: value.address.ar,
          receipt_store_address_en: value.address.en,
          receipt_store_phone: value.phone,
          receipt_footer_fa: value.footer.fa,
          receipt_footer_ar: value.footer.ar,
          receipt_footer_en: value.footer.en,
        }),
      {
        successMessage: t("notifications.receiptSettingsSaved"),
        onSuccess: () => {
          setDraft(null);
          void queryClient.invalidateQueries({ queryKey: ["store-settings"] });
        },
      },
    );
  };

  const inputClass =
    "w-full rounded-lg border border-input px-3 py-2 outline-none focus:border-accent disabled:opacity-55";
  const fieldDir = langTab === "en" ? "ltr" : "rtl";

  return (
    <div className={cn("space-y-3", className)}>
      <div className="text-sm">
        <p className="font-medium text-foreground">{t("admin.receiptSettings.title")}</p>
        <p className="text-xs text-muted">{t("admin.receiptSettings.desc")}</p>
      </div>

      <div className="flex gap-1 rounded-xl bg-background p-1">
        {LOCALES.map((loc) => (
          <button
            key={loc}
            type="button"
            className={cn(
              "min-h-11 flex-1 rounded-lg px-3 text-sm font-medium transition-colors md:min-h-8",
              langTab === loc
                ? "bg-card font-semibold text-accent-dark shadow-sm"
                : "text-muted hover:text-foreground",
            )}
            onClick={() => setLangTab(loc)}
          >
            {LOCALE_LABELS[loc]}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-medium text-foreground">
          {t("admin.receiptSettings.storeName")}
          <input
            key={`name-${langTab}`}
            className={cn(inputClass, "mt-1")}
            dir={fieldDir}
            value={value.name[langTab]}
            disabled={isLoading}
            onChange={(e) => patch("name", langTab, e.target.value)}
          />
        </label>

        <label className="block text-xs font-medium text-foreground">
          {t("admin.receiptSettings.storeAddress")}
          <textarea
            key={`address-${langTab}`}
            className={cn(inputClass, "mt-1")}
            rows={2}
            dir={fieldDir}
            value={value.address[langTab]}
            disabled={isLoading}
            onChange={(e) => patch("address", langTab, e.target.value)}
          />
        </label>

        <label className="block text-xs font-medium text-foreground">
          {t("admin.receiptSettings.footer")}
          <input
            key={`footer-${langTab}`}
            className={cn(inputClass, "mt-1")}
            dir={fieldDir}
            value={value.footer[langTab]}
            disabled={isLoading}
            onChange={(e) => patch("footer", langTab, e.target.value)}
          />
        </label>

        <label className="block text-xs font-medium text-foreground">
          {t("admin.receiptSettings.storePhone")}
          <input
            className={cn(inputClass, "mt-1")}
            dir="ltr"
            inputMode="tel"
            value={value.phone}
            disabled={isLoading}
            onChange={(e) =>
              setDraft((prev) => ({
                ...(prev ?? {
                  name: { ...persisted.name },
                  address: { ...persisted.address },
                  footer: { ...persisted.footer },
                  phone: persisted.phone,
                }),
                phone: e.target.value,
              }))
            }
          />
        </label>

        <p className="text-xs text-muted">
          {t("admin.receiptSettings.langHint")}
        </p>
      </div>

      <Button
        type="button"
        size="sm"
        loading={isPending}
        loadingLabel={t("common.saving")}
        disabled={isLoading || draft === null}
        onClick={save}
      >
        {t("admin.receiptSettings.save")}
      </Button>
    </div>
  );
}
