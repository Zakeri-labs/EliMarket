import type { InputHTMLAttributes } from "react";
import { cn } from "@/app/utils/cn";

export function TableInput({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-9 w-full admin-card px-3 text-sm outline-none focus:border-accent",
        className,
      )}
      {...props}
    />
  );
}
