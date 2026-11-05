"use client";

import { cn } from "@/app/utils/cn";

export function Switch({
  checked,
  onChange,
  label,
  disabled = false,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full transition-colors before:absolute before:inset-x-0 before:-inset-y-2.5 before:content-[''] disabled:opacity-50",
        checked ? "bg-accent" : "bg-[var(--input)]",
      )}
    >
      <span
        className={cn(
          "absolute start-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-[translate] motion-reduce:transition-none",
          checked && "translate-x-5 rtl:-translate-x-5",
        )}
      />
    </button>
  );
}
