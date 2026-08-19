import type { LucideIcon } from "lucide-react";
import { cn } from "@/app/utils/cn";

const SIZE_MAP = { xs: 14, sm: 16, md: 20, lg: 24, xl: 32, "2xl": 40 } as const;

export type IconSize = keyof typeof SIZE_MAP;

type Props = {
  icon: LucideIcon;
  size?: IconSize;
  className?: string;
};

export function AppIcon({ icon: Icon, size = "md", className }: Props) {
  return (
    <Icon
      size={SIZE_MAP[size]}
      className={cn("shrink-0", className)}
      aria-hidden
    />
  );
}
