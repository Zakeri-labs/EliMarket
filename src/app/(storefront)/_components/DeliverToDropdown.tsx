"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, MapPin } from "lucide-react";
import { cn } from "@/app/utils/cn";
import { AppIcon } from "@/components/icons/AppIcon";

const LOCATIONS = ["Muscat, Al Khoudh", "Muscat, Al Ghubra", "Seeb"] as const;

/** Desktop header Deliver-to control — fixed English copy per Hills mock. */
export function DeliverToDropdown({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<(typeof LOCATIONS)[number]>(LOCATIONS[0]);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  return (
    <div ref={rootRef} className={cn("relative w-[220px] shrink-0", className)}>
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
          <span className="block text-[11px] leading-none text-text-secondary">Deliver to</span>
          <span className="mt-1 block truncate text-[14px] leading-tight text-text-primary">
            {selected}
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
          {LOCATIONS.map((option) => (
            <li key={option}>
              <button
                type="button"
                role="option"
                aria-selected={option === selected}
                className={cn(
                  "w-full px-3.5 py-2 text-start text-sm hover:bg-bg-main hover:text-accent-teal",
                  option === selected ? "text-accent-teal" : "text-text-primary",
                )}
                onClick={() => {
                  setSelected(option);
                  setOpen(false);
                }}
              >
                {option}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
