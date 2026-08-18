"use client";

import Link from "next/link";
import { useCartStore } from "@/app/_store/cart-store";

export function StorefrontHeader() {
  const totalItems = useCartStore((s) => s.totalItems());

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold text-emerald-700">
          سوپرمارکت
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/" className="hover:text-emerald-700">
            فروشگاه
          </Link>
          <Link
            href="/cart"
            className="relative rounded-full bg-emerald-600 px-3 py-1.5 text-white hover:bg-emerald-700"
          >
            سبد خرید
            {totalItems > 0 && (
              <span className="absolute -top-2 -left-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs">
                {totalItems}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
