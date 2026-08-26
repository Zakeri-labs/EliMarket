"use client";

import { HomeDesktop } from "@/app/(storefront)/_components/HomeDesktop";
import { HomeMobile } from "@/app/(storefront)/_components/HomeMobile";

/**
 * Both layouts stay in the DOM; visibility is CSS-only.
 * JS media swaps (useSyncExternalStore) caused CLS: mobile full-bleed
 * hero painted first, then desktop sidebar pushed the banner narrower.
 */
export function HomeView() {
  return (
    <>
      <div className="lg:hidden">
        <HomeMobile />
      </div>
      <div className="hidden lg:block">
        <HomeDesktop />
      </div>
    </>
  );
}
