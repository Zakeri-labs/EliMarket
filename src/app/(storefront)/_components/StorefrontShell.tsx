"use client";

import { usePathname } from "next/navigation";
import { AddressGateModal } from "@/app/(storefront)/_components/AddressGateModal";
import { BottomNav } from "@/app/(storefront)/_components/BottomNav";
import { PwaProvider } from "@/app/(storefront)/_components/PwaProvider";
import { StorefrontHeader } from "@/app/(storefront)/_components/StorefrontHeader";
import { cn } from "@/app/utils/cn";
import { STOREFRONT_CONTAINER } from "@/config/layout";

export function StorefrontShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isProductDetail = pathname.startsWith("/products/");
  const isCart = pathname === "/cart";
  const isCheckout = pathname === "/checkout" || pathname.startsWith("/pay/");
  /** Keep bottom nav off pages that already have a sticky mobile CTA */
  const hideMobileNav = isProductDetail || isCheckout || isCart;
  const hideHeader = isProductDetail;
  const mobileFullHeight = isProductDetail || isCart;

  return (
    <div
      className={cn(
        "flex min-h-full w-full flex-1 flex-col bg-background storefront-hills",
        mobileFullHeight && "max-lg:h-[100dvh] max-lg:max-h-[100dvh] max-lg:overflow-hidden",
      )}
    >
      {!hideHeader ? (
        <StorefrontHeader />
      ) : (
        <div className="hidden lg:block">
          <StorefrontHeader />
        </div>
      )}
      <div
        className={cn(
          "flex-1",
          isProductDetail && "max-lg:flex max-lg:min-h-0 max-lg:flex-col max-lg:overflow-hidden",
          isCart && "max-lg:flex max-lg:min-h-0 max-lg:flex-col max-lg:overflow-hidden",
          !hideMobileNav && "pb-[calc(4.25rem+env(safe-area-inset-bottom))] lg:pb-0",
          isCheckout && "pb-[calc(5.5rem+env(safe-area-inset-bottom))] lg:pb-0",
        )}
      >
        <div
          className={cn(
            STOREFRONT_CONTAINER,
            "min-h-full",
            isProductDetail && "max-lg:flex max-lg:min-h-0 max-lg:flex-1 max-lg:flex-col",
            isCart && "max-lg:flex max-lg:min-h-0 max-lg:flex-1 max-lg:flex-col max-lg:px-0",
          )}
        >
          {children}
        </div>
      </div>
      {!hideMobileNav && <BottomNav />}
      <PwaProvider />
      <AddressGateModal />
    </div>
  );
}
