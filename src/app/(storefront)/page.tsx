import {
  CategoryGrid,
} from "@/app/(storefront)/_components/CategoryGrid";
import { FlashDeals } from "@/app/(storefront)/_components/FlashDeals";
import {
  HeroBanner,
  LocationBar,
  SearchBar,
} from "@/app/(storefront)/_components/HomeSections";
import { ProductGrid } from "@/app/(storefront)/_components/ProductGrid";
import { CartDisabledNotice } from "@/app/(storefront)/_components/CartGate";

export default function StorefrontHomePage() {
  return (
    <main className="space-y-6 py-4 md:space-y-8 md:py-6 lg:py-8">
      <CartDisabledNotice />
      {/* Top bar: location + search — side by side on desktop */}
      <div className="grid gap-3 md:grid-cols-2 md:gap-4">
        <LocationBar />
        <SearchBar />
      </div>

      {/* Hero full width on mobile, left column on large screens */}
      <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
        <div className="space-y-6 lg:col-span-8 lg:space-y-8">
          <HeroBanner />
          <FlashDeals />
          <ProductGrid />
        </div>
        <aside className="space-y-6 lg:col-span-4 lg:space-y-8">
          <CategoryGrid />
        </aside>
      </div>
    </main>
  );
}
