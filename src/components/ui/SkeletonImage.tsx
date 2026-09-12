import { cn } from "@/app/utils/cn";

/** Plain shimmering block shown while an image loads; relies on the
 * ancestor `.skeleton` class (see globals.css) for the grey pulse. */
export function SkeletonImage({ className }: { className?: string }) {
  return <div className={cn("h-full w-full", className)} />;
}
