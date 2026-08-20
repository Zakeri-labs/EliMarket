"use client";

import { usePathname } from "next/navigation";
import { BottomNav } from "@/app/(storefront)/_components/BottomNav";
import { PwaProvider } from "@/app/(storefront)/_components/PwaProvider";
import { StorefrontHeader } from "@/app/(storefront)/_components/StorefrontHeader";
import { cn } from "@/app/utils/cn";
import { STOREFRONT_CONTAINER } from "@/config/layout";

export function StorefrontShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isProductDetail = pathname.startsWith("/products/");
  const isCart = pathname === "/cart";
  const isCheckout = pathname === "/checkout";
  const hideMobileNav = isProductDetail || isCheckout || isCart;
  const hideHeader = isProductDetail;
  const mobileFullHeight = isProductDetail || isCart;

  return (
    <div
      className={cn(
        "flex min-h-full w-full flex-1 flex-col bg-background",
        mobileFullHeight && "max-md:h-[100dvh] max-md:max-h-[100dvh] max-md:overflow-hidden",
      )}
    >
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
          isProductDetail && "max-md:flex max-md:min-h-0 max-md:flex-col max-md:overflow-hidden",
          isCart && "max-md:flex max-md:min-h-0 max-md:flex-col max-md:overflow-hidden",
          !hideMobileNav && "pb-24 md:pb-0",
        )}
      >
        <div
          className={cn(
            STOREFRONT_CONTAINER,
            "min-h-full",
            isProductDetail && "max-md:flex max-md:min-h-0 max-md:flex-1 max-md:flex-col",
            isCart && "max-md:flex max-md:min-h-0 max-md:flex-1 max-md:flex-col max-md:px-0",
          )}
        >
          {children}
        </div>
      </div>
      {!hideMobileNav && <BottomNav />}
      <PwaProvider />
    </div>
  );
}
