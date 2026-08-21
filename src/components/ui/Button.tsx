"use client";

import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/app/utils/cn";
import { Spinner } from "@/components/ui/Spinner";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  loading?: boolean;
  loadingLabel?: string;
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  fullWidth,
  type = "button",
  loading = false,
  loadingLabel,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium transition-all active:scale-[0.98] disabled:pointer-events-none",
        !loading && "disabled:opacity-70",
        size === "sm" && "rounded-xl px-3 py-1.5 text-xs",
        size === "md" && "rounded-2xl px-4 py-2.5 text-sm",
        size === "lg" && "rounded-2xl px-6 py-3.5 text-base",
        variant === "primary" &&
          "bg-accent text-black hover:bg-accent-dark hover:text-white shadow-[0_4px_20px_var(--accent-glow)]",
        variant === "secondary" &&
          "bg-surface-elevated text-foreground border border-border hover:border-accent/40",
        variant === "outline" &&
          "border border-border bg-transparent text-foreground hover:border-accent/50",
        variant === "ghost" && "bg-transparent text-muted hover:text-foreground",
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {loading ? (
        <>
          <Spinner size={size === "lg" ? "md" : "sm"} />
          <span>{loadingLabel ?? children}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
