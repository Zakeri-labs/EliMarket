import type { InputHTMLAttributes } from "react";
import { cn } from "@/app/utils/cn";

export function TableInput({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-9 w-full rounded-xl border border-[#e4e4e7] bg-white px-3 text-sm outline-none focus:border-[#0d9488]",
        className,
      )}
      {...props}
    />
  );
}
