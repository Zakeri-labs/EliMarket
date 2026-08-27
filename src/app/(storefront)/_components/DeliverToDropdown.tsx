"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, MapPin } from "lucide-react";
import { cn } from "@/app/utils/cn";
import { AppIcon } from "@/components/icons/AppIcon";
import { useTranslations } from "@/i18n/use-translations";

type DeliverArea = { key: string; serviceable: boolean };

const LOCATIONS: readonly DeliverArea[] = [
  { key: "home.deliverAreaMuscatKhoudh", serviceable: true },
  { key: "home.deliverAreaMuscatGhubra", serviceable: true },
  { key: "home.deliverAreaSeeb", serviceable: true },
  { key: "home.deliverAreaSohar", serviceable: false },
  { key: "home.deliverAreaSalalah", serviceable: false },
  { key: "home.deliverAreaNizwa", serviceable: false },
];

/** Desktop header Deliver-to control. Selecting an out-of-service area shows a localized notice. */
export function DeliverToDropdown({ className }: { className?: string }) {
  const { t, dir } = useTranslations();
  const [open, setOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState(LOCATIONS[0].key);
  const [outOfAreaKey, setOutOfAreaKey] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  return (
    <div ref={rootRef} dir={dir} className={cn("relative w-[220px] shrink-0", className)}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center gap-3 rounded-lg border border-border-subtle bg-transparent px-[14px] py-2.5 text-start"
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
          <span className="mt-1 block truncate text-[14px] leading-tight text-text-primary">
            {t(selectedKey)}
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
          className="absolute inset-x-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-lg border border-border-subtle bg-bg-card py-1 shadow-lg"
        >
          {LOCATIONS.map((option) => {
            const isSelected = option.key === selectedKey;
            return (
              <li key={option.key}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 px-3.5 py-2 text-start text-sm hover:bg-bg-main",
                    option.serviceable
                      ? isSelected
                        ? "text-accent-teal"
                        : "text-text-primary hover:text-accent-teal"
                      : "text-text-secondary",
                  )}
                  onClick={() => {
                    if (option.serviceable) {
                      setSelectedKey(option.key);
                      setOutOfAreaKey(null);
                    } else {
                      setOutOfAreaKey(option.key);
                    }
                    setOpen(false);
                  }}
                >
                  <span className="truncate">{t(option.key)}</span>
                  {!option.serviceable ? (
                    <span className="shrink-0 rounded-full bg-bg-main px-2 py-0.5 text-[10px] leading-none text-text-secondary">
                      {t("home.comingSoonTag")}
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
      {!open && outOfAreaKey ? (
        <p
          role="status"
          className="absolute inset-x-0 top-[calc(100%+6px)] z-40 rounded-lg border border-border-subtle bg-bg-card px-3 py-2 text-[12px] leading-snug text-text-secondary shadow-lg"
        >
          {t("home.outOfServiceArea", { area: t(outOfAreaKey) })}
        </p>
      ) : null}
    </div>
  );
}
