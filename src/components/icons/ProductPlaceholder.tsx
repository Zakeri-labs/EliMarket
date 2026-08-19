import { ShoppingBag } from "lucide-react";
import { AppIcon, type IconSize } from "@/components/icons/AppIcon";
import { cn } from "@/app/utils/cn";

export function ProductPlaceholder({
  size = "lg",
  className,
}: {
  size?: IconSize;
  className?: string;
}) {
  return (
    <div className={cn("flex h-full w-full items-center justify-center text-muted", className)}>
      <AppIcon icon={ShoppingBag} size={size} />
    </div>
  );
}
