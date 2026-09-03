"use client";

import { FormEvent, KeyboardEvent, Suspense, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ScanLine, Search } from "lucide-react";
import { cn } from "@/app/utils/cn";
import { AppIcon } from "@/components/icons/AppIcon";
import { ProductPlaceholder } from "@/components/icons/ProductPlaceholder";
import { StorefrontImage } from "@/components/ui/StorefrontImage";
import { useTranslations } from "@/i18n/use-translations";
import { Price } from "@/components/ui/Price";
import { useProducts } from "@/app/(storefront)/_hooks/use-products";
import { productCover } from "@/lib/products/gallery";
import { matchesProductQuery } from "@/lib/products/search";
import { resolveProductName } from "@/lib/i18n/product-name";
import type { Product } from "@/app/_types/database.types";

type Props = {
  className?: string;
  showScan?: boolean;
  autoFocus?: boolean;
  size?: "md" | "lg" | "desktop";
  placeholder?: string;
};

const MAX_SUGGESTIONS = 6;

function SearchBarForm({
  className,
  showScan = false,
  autoFocus = false,
  size = "md",
  placeholder,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t, locale } = useTranslations();
  const { data: products } = useProducts();
  const onSearchPage = pathname === "/search";
  const [q, setQ] = useState(onSearchPage ? (searchParams.get("q") ?? "") : "");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapperRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (onSearchPage) setQ(searchParams.get("q") ?? "");
  }, [onSearchPage, searchParams]);

  useEffect(() => {
    setActiveIndex(-1);
  }, [q]);

  useEffect(() => {
    function handlePointerDown(e: PointerEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  const suggestions = useMemo(() => {
    const query = q.trim();
    if (!query || !products) return [];
    return products.filter((p) => matchesProductQuery(p, query)).slice(0, MAX_SUGGESTIONS);
  }, [products, q]);

  const showDropdown = open && q.trim().length > 0;

  function goToProduct(slug: string) {
    setOpen(false);
    router.push(`/products/${slug}`);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (showDropdown && activeIndex >= 0 && suggestions[activeIndex]) {
      goToProduct(suggestions[activeIndex].slug);
      return;
    }
    setOpen(false);
    const params = new URLSearchParams(onSearchPage ? searchParams.toString() : "");
    const value = q.trim();
    if (value) params.set("q", value);
    else params.delete("q");
    const query = params.toString();
    router.push(query ? `/search?${query}` : "/search");
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (!showDropdown) return;
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if (!suggestions.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    }
  }

  function SuggestionsDropdown() {
    if (!showDropdown) return null;
    return (
      <div
        role="listbox"
        className="absolute inset-x-0 top-full z-30 mt-2 max-h-80 overflow-y-auto rounded-lg border border-border-subtle bg-bg-card p-1.5 shadow-lg"
      >
        {suggestions.length ? (
          suggestions.map((product: Product, index) => {
            const cover = productCover(product);
            return (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                role="option"
                aria-selected={index === activeIndex}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-md p-2 text-start",
                  index === activeIndex ? "bg-surface-elevated" : "hover:bg-surface-elevated",
                )}
              >
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-transparent">
                  {cover ? (
                    <StorefrontImage
                      src={cover.image_url}
                      blurHash={cover.blur_hash}
                      alt=""
                      fill
                      sizes="40px"
                      withBlur={false}
                      className="bg-transparent object-contain p-0.5"
                    />
                  ) : (
                    <ProductPlaceholder size="sm" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-text-primary">
                    {resolveProductName(product, locale)}
                  </p>
                </div>
                <Price
                  amount={Number(product.price)}
                  currency={product.currency}
                  className="shrink-0 text-xs font-semibold text-text-primary"
                />
              </Link>
            );
          })
        ) : (
          <p className="p-3 text-center text-sm text-text-secondary">{t("search.noResults")}</p>
        )}
      </div>
    );
  }

  if (size === "desktop") {
    return (
      <form
        onSubmit={onSubmit}
        className={cn("relative w-full max-w-[700px]", className)}
        ref={(node) => {
          wrapperRef.current = node;
        }}
      >
        <button
          type="submit"
          className="absolute start-3.5 top-1/2 z-10 -translate-y-1/2 text-text-secondary hover:text-text-primary"
          aria-label={t("nav.search")}
        >
          <AppIcon icon={Search} size="sm" />
        </button>
        <input
          type="search"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(e.target.value.trim().length > 0);
          }}
          onFocus={() => q.trim() && setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={placeholder ?? "Search for products, brands and categories"}
          autoFocus={autoFocus}
          aria-label={t("nav.search")}
          role="combobox"
          aria-expanded={showDropdown}
          aria-autocomplete="list"
          autoComplete="off"
          className="h-11 w-full rounded-lg border border-border-subtle bg-bg-card pe-4 ps-10 text-sm text-text-primary outline-none placeholder:text-text-secondary focus:border-accent-teal"
        />
        <SuggestionsDropdown />
      </form>
    );
  }

  return (
    <form onSubmit={onSubmit} className={cn("flex min-w-0 gap-2", className)}>
      <div
        className="relative min-w-0 flex-1"
        ref={(node) => {
          wrapperRef.current = node;
        }}
      >
        <button
          type="submit"
          className="absolute start-2 top-1/2 z-10 -translate-y-1/2 rounded-lg p-1 text-text-secondary hover:text-text-primary"
          aria-label={t("nav.search")}
        >
          <AppIcon icon={Search} size="sm" />
        </button>
        <input
          type="search"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(e.target.value.trim().length > 0);
          }}
          onFocus={() => q.trim() && setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={placeholder ?? t("home.searchPlaceholder")}
          autoFocus={autoFocus}
          role="combobox"
          aria-expanded={showDropdown}
          aria-autocomplete="list"
          autoComplete="off"
          className={cn(
            "w-full border border-border-subtle bg-bg-card text-sm text-text-primary outline-none transition-colors placeholder:text-text-secondary focus:border-accent-teal",
            size === "lg"
              ? "h-12 rounded-2xl ps-10 pe-4 lg:rounded-lg"
              : "h-11 rounded-2xl ps-10 pe-4 lg:rounded-lg",
          )}
        />
        <SuggestionsDropdown />
      </div>
      {showScan ? (
        <Link
          href="/search"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-border bg-surface-elevated text-muted hover:text-foreground"
          aria-label={t("home.searchPlaceholder")}
        >
          <AppIcon icon={ScanLine} size="sm" />
        </Link>
      ) : null}
    </form>
  );
}

export function StorefrontSearchBar(props: Props) {
  return (
    <Suspense
      fallback={
        <div
          className={cn(
            "min-w-0",
            props.size === "desktop"
              ? "h-11 max-w-[700px] flex-1 rounded-lg border border-border-subtle bg-bg-card"
              : props.size === "lg"
                ? "h-12 flex-1 rounded-2xl border border-border bg-surface-elevated"
                : "h-11 flex-1 rounded-2xl border border-border bg-surface-elevated",
            props.className,
          )}
        />
      }
    >
      <SearchBarForm {...props} />
    </Suspense>
  );
}
