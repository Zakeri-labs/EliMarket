"use client";

import { CategoryGrid } from "@/app/(storefront)/_components/CategoryGrid";
import { FlashDeals } from "@/app/(storefront)/_components/FlashDeals";
import { HeroCarousel } from "@/app/(storefront)/_components/HeroCarousel";
import { LocationBar, SearchBar } from "@/app/(storefront)/_components/HomeSections";
import { ProductGrid } from "@/app/(storefront)/_components/ProductGrid";

export function HomeMobile() {
  return (
    <div className="space-y-6 py-4">
      <div className="space-y-3">
        <LocationBar />
        <SearchBar />
      </div>
      <HeroCarousel />
      <CategoryGrid />
      <FlashDeals />
      <ProductGrid />
    </div>
  );
}
