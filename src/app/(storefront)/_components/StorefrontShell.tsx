"use client";

import { usePathname } from "next/navigation";
import { BottomNav } from "@/app/(storefront)/_components/BottomNav";
import { StorefrontHeader } from "@/app/(storefront)/_components/StorefrontHeader";
import { cn } from "@/app/utils/cn";
import { STOREFRONT_CONTAINER } from "@/config/layout";

export function StorefrontShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isProductDetail = pathname.startsWith("/products/");
  const isCheckout = pathname === "/checkout";
  const hideMobileNav = isProductDetail || isCheckout;
  const hideHeader = isProductDetail;

  return (
    <div className="flex min-h-full w-full flex-1 flex-col bg-background">
      {!hideHeader ? (
        <StorefrontHeader />
      ) : (
        <div className="hidden md:block">
          <StorefrontHeader />
        </div>
      )}
      <div
        className={cn(
          "flex-1",
          /* bottom padding only on mobile where bottom nav shows */
          !hideMobileNav && "pb-24 md:pb-0",
        )}
      >
        <div className={cn(STOREFRONT_CONTAINER, "min-h-full")}>{children}</div>
      </div>
      {!hideMobileNav && <BottomNav />}
    </div>
  );
}
