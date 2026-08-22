"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ScanLine, Search } from "lucide-react";
import { cn } from "@/app/utils/cn";
import { AppIcon } from "@/components/icons/AppIcon";
import { useTranslations } from "@/i18n/use-translations";

type Props = {
  className?: string;
  showScan?: boolean;
  autoFocus?: boolean;
  size?: "md" | "lg" | "desktop";
  placeholder?: string;
};

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
  const { t } = useTranslations();
  const onSearchPage = pathname === "/search";
  const [q, setQ] = useState(onSearchPage ? (searchParams.get("q") ?? "") : "");

  useEffect(() => {
    if (onSearchPage) setQ(searchParams.get("q") ?? "");
  }, [onSearchPage, searchParams]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(onSearchPage ? searchParams.toString() : "");
    const value = q.trim();
    if (value) params.set("q", value);
    else params.delete("q");
    const query = params.toString();
    router.push(query ? `/search?${query}` : "/search");
  }

  if (size === "desktop") {
    return (
      <form onSubmit={onSubmit} className={cn("relative w-full max-w-[700px]", className)}>
        <AppIcon
          icon={Search}
          size="sm"
          className="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-text-secondary"
        />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder ?? "Search for products, brands and categories"}
          autoFocus={autoFocus}
          aria-label={t("nav.search")}
          className="h-11 w-full rounded-lg border border-border-subtle bg-bg-card pe-4 ps-10 text-sm text-text-primary outline-none placeholder:text-text-secondary focus:border-accent-teal"
        />
      </form>
    );
  }

  return (
    <form onSubmit={onSubmit} className={cn("flex min-w-0 gap-2", className)}>
      <div className="relative min-w-0 flex-1">
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
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder ?? t("home.searchPlaceholder")}
          autoFocus={autoFocus}
          className={cn(
            "w-full border border-border-subtle bg-bg-card text-sm text-text-primary outline-none transition-colors placeholder:text-text-secondary focus:border-accent-teal",
            size === "lg"
              ? "h-12 rounded-2xl ps-10 pe-4 lg:rounded-lg"
              : "h-11 rounded-2xl ps-10 pe-4 lg:rounded-lg",
          )}
        />
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
