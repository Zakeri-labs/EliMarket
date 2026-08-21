import { cn } from "@/app/utils/cn";

/** Same logo the admin table uses while product images load (`/icon.png`). */
export function SkeletonImage({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/icon.png"
      alt=""
      className={cn("h-full w-full object-contain p-1.5", className)}
    />
  );
}
