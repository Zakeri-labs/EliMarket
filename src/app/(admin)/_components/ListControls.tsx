"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useLocaleStore } from "@/app/_store/locale-store";
import { AppIcon } from "@/components/icons/AppIcon";
import { Button } from "@/components/ui/Button";
import { formatCount, getDirection } from "@/i18n/config";
import { useTranslations } from "@/i18n/use-translations";

const PAGE_SIZE = 10;

// Only what an admin can see: never ids, links, or timestamps.
const HIDDEN_KEY = /(^|_)(id|url|at|path|slug|hash)$/;

function searchText(value: unknown, withId: boolean): string {
  if (Array.isArray(value)) return value.map((v) => searchText(v, withId)).join(" ");
  if (value && typeof value === "object") {
    return Object.entries(value)
      .filter(([key]) => !HIDDEN_KEY.test(key) || (withId && key === "id"))
      .map(([, v]) => searchText(v, withId))
      .join(" ");
  }
  return value == null || typeof value === "boolean" ? "" : String(value);
}

/** Client-side search and paging for a simple admin list. Searches every field of each item. */
export function useListControls<T>(
  items: T[],
  options: {
    filter?: (item: T) => boolean;
    reveal?: (item: T) => boolean;
    searchId?: boolean;
  } = {},
) {
  const { filter, reveal, searchId = false } = options;
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter(
      (item) =>
        (!filter || filter(item)) && (!q || searchText(item, searchId).toLowerCase().includes(q)),
    );
  }, [items, query, filter, searchId]);

  const pageCount = Math.max(Math.ceil(matches.length / PAGE_SIZE), 1);
  const safePage = Math.min(page, pageCount - 1);

  // A deep link (e.g. a notification) must land on the page holding its item.
  const revealIndex = reveal ? matches.findIndex(reveal) : -1;
  const [revealedFor, setRevealedFor] = useState<typeof reveal>(undefined);
  if (reveal && revealIndex >= 0 && revealedFor !== reveal) {
    setRevealedFor(() => reveal);
    setPage(Math.floor(revealIndex / PAGE_SIZE));
  }

  return {
    query,
    setQuery: (next: string) => {
      setQuery(next);
      setPage(0);
    },
    page: safePage,
    setPage,
    pageCount,
    total: items.length,
    matchCount: matches.length,
    visible: matches.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE),
  };
}

type ListState = ReturnType<typeof useListControls<never>> | ReturnType<typeof useListControls>;

export function ListControls({
  list,
  entity,
  filters,
  onClearFilters,
}: {
  list: Pick<
    ListState,
    "query" | "setQuery" | "page" | "setPage" | "pageCount" | "total" | "matchCount"
  >;
  entity: string;
  filters?: React.ReactNode;
  onClearFilters?: () => void;
}) {
  const { t } = useTranslations();

  if (list.total === 0) return null;

  return (
    <div className="mb-3 space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative block min-w-0 flex-1 sm:max-w-md">
          <span className="sr-only">{t("table.searchIn", { entity })}</span>
          <AppIcon
            icon={Search}
            size="sm"
            className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="search"
            value={list.query}
            onChange={(e) => list.setQuery(e.target.value)}
            placeholder={t("table.searchIn", { entity })}
            className="w-full rounded-xl border border-input bg-card ps-10 pe-4 outline-none"
          />
        </label>
        {filters}
      </div>
      {list.matchCount === 0 ? (
        <div className="admin-card space-y-3 p-8 text-center text-sm text-muted">
          <p>{list.query ? t("table.noResults", { query: list.query }) : t("adminUi.noMatches")}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              list.setQuery("");
              onClearFilters?.();
            }}
          >
            {t("table.clearFilters")}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

export function ListError({ error, onRetry }: { error: Error; onRetry: () => void }) {
  const { t } = useTranslations();
  return (
    <div role="alert" className="admin-card space-y-3 p-8 text-center text-sm">
      <AppIcon icon={AlertTriangle} size="md" className="mx-auto text-red-700" />
      <p className="font-semibold">{t("table.loadFailed")}</p>
      <p className="text-muted">{error.message}</p>
      <Button type="button" variant="outline" size="sm" onClick={onRetry}>
        {t("table.retry")}
      </Button>
    </div>
  );
}

/** Sits under a list so the next page is reachable from where reading ends. */
export function ListPager({
  list,
}: {
  list: { page: number; pageCount: number; setPage: (page: number) => void };
}) {
  const { t } = useTranslations();
  const locale = useLocaleStore((s) => s.locale);
  const rtl = getDirection(locale) === "rtl";

  if (list.pageCount <= 1) return null;

  return (
    <nav aria-label={t("table.pagination")} className="mt-3 flex items-center justify-center gap-1">
      <button
        type="button"
        aria-label={t("table.prev")}
        disabled={list.page === 0}
        onClick={() => list.setPage(list.page - 1)}
        className="grid size-11 place-items-center rounded-xl text-muted transition-colors hover:bg-accent/10 hover:text-accent-dark disabled:pointer-events-none disabled:opacity-40"
      >
        <AppIcon icon={rtl ? ChevronRight : ChevronLeft} size="sm" />
      </button>
      <span className="min-w-14 text-center text-xs font-semibold tabular-nums" dir="ltr">
        {formatCount(list.page + 1, locale)} / {formatCount(list.pageCount, locale)}
      </span>
      <button
        type="button"
        aria-label={t("table.next")}
        disabled={list.page >= list.pageCount - 1}
        onClick={() => list.setPage(list.page + 1)}
        className="grid size-11 place-items-center rounded-xl text-muted transition-colors hover:bg-accent/10 hover:text-accent-dark disabled:pointer-events-none disabled:opacity-40"
      >
        <AppIcon icon={rtl ? ChevronLeft : ChevronRight} size="sm" />
      </button>
    </nav>
  );
}
