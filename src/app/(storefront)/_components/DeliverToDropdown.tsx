"use client";

import { useEffect, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, MapPin, MapPinOff } from "lucide-react";
import { getDeliveryAreasAction } from "@/app/_actions/delivery-area-actions";
import { cn } from "@/app/utils/cn";
import { useLocationStore } from "@/app/_store/location-store";
import { AppIcon } from "@/components/icons/AppIcon";
import { Button } from "@/components/ui/Button";
import { resolveDeliveryAreaName } from "@/lib/i18n/delivery-area-name";
import { useTranslations } from "@/i18n/use-translations";

type Variant = "header" | "block";

/**
 * Storefront "Deliver to" control. Areas come from the admin-managed `delivery_areas`
 * table; the selected area's slug is persisted in `useLocationStore`. A guest who hasn't
 * picked one sees a "select your area" prompt instead of a fake default. Picking a
 * non-serviceable area opens a localized "coming soon" notice.
 */
export function DeliverToDropdown({
  className,
  variant = "header",
}: {
  className?: string;
  variant?: Variant;
}) {
  const { t, dir, locale } = useTranslations();
  const selectedSlug = useLocationStore((s) => s.selectedAreaSlug);
  const setArea = useLocationStore((s) => s.setArea);
  const [open, setOpen] = useState(false);
  const [outOfAreaName, setOutOfAreaName] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const { data: areas = [] } = useQuery({
    queryKey: ["delivery-areas"],
    queryFn: async () => {
      const result = await getDeliveryAreasAction();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
  });

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  const selected = areas.find((area) => area.slug === selectedSlug) ?? null;
  const selectedLabel = selected
    ? resolveDeliveryAreaName(selected, locale)
    : t("home.deliverSelectArea");

  return (
    <div
      ref={rootRef}
      dir={dir}
      className={cn(
        "relative",
        variant === "header" ? "w-[220px] shrink-0" : "w-full",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "flex w-full items-center gap-3 border border-border-subtle bg-transparent text-start",
          variant === "header" ? "rounded-lg px-[14px] py-2.5" : "rounded-2xl px-4 py-3",
        )}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-border-subtle">
          <AppIcon icon={MapPin} size="xs" className="text-text-secondary" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[11px] leading-none text-text-secondary">
            {t("home.deliverTo")}
          </span>
          <span
            suppressHydrationWarning
            className="mt-1 block truncate text-[14px] leading-tight text-text-primary"
          >
            {selectedLabel}
          </span>
        </span>
        <AppIcon
          icon={ChevronDown}
          size="sm"
          className={cn("shrink-0 text-text-secondary transition-transform", open && "rotate-180")}
        />
      </button>
      {open ? (
        <ul
          role="listbox"
          className="absolute inset-x-0 top-[calc(100%+6px)] z-50 max-h-[320px] overflow-y-auto overflow-x-hidden rounded-lg border border-border-subtle bg-bg-card py-1 shadow-lg"
        >
          {areas.length === 0 ? (
            <li className="px-3.5 py-2 text-sm text-text-secondary">
              {t("home.deliverAreasEmpty")}
            </li>
          ) : (
            areas.map((area) => {
              const isSelected = area.slug === selectedSlug;
              const name = resolveDeliveryAreaName(area, locale);
              return (
                <li key={area.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 px-3.5 py-2 text-start text-sm hover:bg-bg-main",
                      area.serviceable
                        ? isSelected
                          ? "text-accent-teal"
                          : "text-text-primary hover:text-accent-teal"
                        : "text-text-secondary",
                    )}
                    onClick={() => {
                      if (area.serviceable) {
                        setArea(area.slug);
                      } else {
                        setOutOfAreaName(name);
                      }
                      setOpen(false);
                    }}
                  >
                    <span className="truncate">{name}</span>
                    {!area.serviceable ? (
                      <span className="shrink-0 rounded-full bg-bg-main px-2 py-0.5 text-[10px] leading-none text-text-secondary">
                        {t("home.comingSoonTag")}
                      </span>
                    ) : null}
                  </button>
                </li>
              );
            })
          )}
        </ul>
      ) : null}

      <Dialog.Root
        open={outOfAreaName !== null}
        onOpenChange={(next) => !next && setOutOfAreaName(null)}
      >
        <Dialog.Portal>
          <Dialog.Overlay
            className="fixed inset-0"
            style={{ zIndex: 100050, background: "rgba(15, 23, 18, 0.55)", backdropFilter: "blur(6px)" }}
          />
          <Dialog.Content
            dir={dir}
            className="fixed w-[min(30rem,calc(100vw-1.5rem))] rounded-2xl border border-border-subtle bg-bg-card p-7 text-center shadow-2xl"
            style={{ zIndex: 100051, left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}
          >
            <span className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-bg-main">
              <AppIcon icon={MapPinOff} size="xl" className="text-accent-teal" />
            </span>
            <Dialog.Title className="text-xl font-bold text-text-primary">
              {t("home.outOfServiceAreaTitle")}
            </Dialog.Title>
            <Dialog.Description className="mt-3 text-[15px] leading-relaxed text-text-secondary">
              {outOfAreaName ? t("home.outOfServiceArea", { area: outOfAreaName }) : null}
            </Dialog.Description>
            <Button fullWidth className="mt-6" onClick={() => setOutOfAreaName(null)}>
              {t("home.outOfServiceAreaAck")}
            </Button>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
