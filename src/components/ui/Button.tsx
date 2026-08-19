import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/app/utils/cn";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  fullWidth,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center font-medium transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none",
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
    />
  );
}
