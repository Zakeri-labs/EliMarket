import type { LucideIcon } from "lucide-react";
import { AppIcon } from "@/components/icons/AppIcon";
import { cn } from "@/app/utils/cn";

export function SectionHeading({
  icon,
  children,
  className,
}: {
  icon: LucideIcon;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2 className={cn("flex items-center gap-2 font-semibold", className)}>
      <AppIcon icon={icon} size="sm" className="text-accent" />
      {children}
    </h2>
  );
}
