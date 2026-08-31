"use client";

import { DeliverToDropdown } from "@/app/(storefront)/_components/DeliverToDropdown";
import { StorefrontSearchBar } from "@/app/(storefront)/_components/StorefrontSearchBar";

export function LocationBar({ className }: { className?: string }) {
  return <DeliverToDropdown variant="block" className={className} />;
}

export function SearchBar() {
  return <StorefrontSearchBar showScan size="lg" />;
}
