import type { InputHTMLAttributes } from "react";
import { cn } from "@/app/utils/cn";

export function TableInput({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full border-input bg-card px-3 outline-none focus-visible:border-accent",
        className,
      )}
      {...props}
    />
  );
}
