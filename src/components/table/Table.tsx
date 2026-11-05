"use client";

import { omanYmd, toOmanInput } from "@/config/oman-time";
import * as React from "react";
import {
  type Column,
  type ColumnDef,
  type ColumnFiltersState,
  type OnChangeFn,
  type PaginationState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ChevronDown,
  ChevronUp,
  Download,
  Plus,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useLocaleStore } from "@/app/_store/locale-store";
import { cn } from "@/app/utils/cn";
import { getDirection } from "@/i18n/config";
import { useTranslations } from "@/i18n/use-translations";
import { AppIcon } from "@/components/icons/AppIcon";
import { Button } from "@/components/ui/Button";
import { ColumnFilter } from "@/components/table/ColumnFilter";
import { TableInput } from "@/components/table/TableInput";
import "@/components/table/_types/table.types";
import { Select } from "@/components/ui/Select";

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 25, 50] as const;

export type DataTableProps<T> = {
  data: T[];
  columns: ColumnDef<T>[];
  entityName?: string;
  isSkeleton?: boolean;
  onRefresh?: () => void;
  onExport?: () => Promise<Record<string, unknown>[]>;
  onCreateClick?: () => void;
  createLabel?: string;
  enableExport?: boolean;
  enableColumnFilters?: boolean;
  pageSizeOptions?: number[];
  globalFilterForm?: React.ReactNode;
  pagination?: PaginationState;
  onPaginationChange?: OnChangeFn<PaginationState>;
  manualFiltering?: boolean;
  manualSorting?: boolean;
  manualPagination?: boolean;
  totalItems?: number;
  /** Renders nothing, e.g. while the page shows a load error instead of an empty table. */
  hidden?: boolean;
};

function DefaultTextColumnFilter({
  value,
  onFilterChange,
  placeholder,
}: {
  value: unknown;
  onFilterChange: (value: unknown) => void;
  placeholder?: string;
}) {
  const { t } = useTranslations();
  return (
    <TableInput
      autoFocus
      placeholder={placeholder ?? t("table.searchDefault")}
      value={typeof value === "string" || typeof value === "number" ? String(value) : ""}
      onChange={(e) => onFilterChange(e.target.value)}
    />
  );
}

/** Page numbers around the current page; `null` marks a gap. */
function pageWindow(current: number, total: number): (number | null)[] {
  const pages: (number | null)[] = [];
  for (let page = 0; page < total; page += 1) {
    if (page === 0 || page === total - 1 || Math.abs(page - current) <= 1) pages.push(page);
    else if (pages[pages.length - 1] !== null) pages.push(null);
  }
  return pages;
}

function columnWidth<T>(column: Column<T, unknown>): number {
  return column.columnDef.meta?.minWidth ?? column.columnDef.size ?? 150;
}

const SKELETON_ROWS = 6;

function isImageColumn(id: string) {
  return /image|photo|thumb/i.test(id);
}

function getColumnHeaderLabel<T>(column: Column<T, unknown>): string {
  const h = column.columnDef.header;
  if (typeof h === "string") return h;
  const meta = column.columnDef.meta as { mobileLabel?: string } | undefined;
  return meta?.mobileLabel ?? column.id;
}

export function DataTable<T>({
  data,
  columns,
  entityName,
  isSkeleton = false,
  onRefresh,
  onExport,
  onCreateClick,
  createLabel,
  enableExport = true,
  enableColumnFilters = true,
  pageSizeOptions = [...DEFAULT_PAGE_SIZE_OPTIONS],
  globalFilterForm,
  pagination: paginationProp,
  onPaginationChange: onPaginationChangeProp,
  manualFiltering = false,
  manualSorting = false,
  manualPagination = false,
  totalItems: totalItemsProp,
  hidden = false,
}: DataTableProps<T>) {
  const { t } = useTranslations();
  const locale = useLocaleStore((s) => s.locale);
  const tableDir = getDirection(locale);
  const resolvedEntityName = entityName ?? t("table.defaultEntity");

  const [internalPagination, setInternalPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const pagination = paginationProp ?? internalPagination;
  const onPaginationChange = onPaginationChangeProp ?? setInternalPagination;

  const [internalGlobalFilter, setInternalGlobalFilter] = React.useState("");
  const [internalColumnFilters, setInternalColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [internalSorting, setInternalSorting] = React.useState<SortingState>([]);
  const [internalColumnVisibility, setInternalColumnVisibility] = React.useState<VisibilityState>({});

  const resolvedGlobalFilter = internalGlobalFilter;
  const resolvedColumnFilters = internalColumnFilters;
  const resolvedSorting = internalSorting;
  const resolvedColumnVisibility: VisibilityState = {
    ...internalColumnVisibility,
    id: false,
  };

  const displayColumns = React.useMemo(
    () =>
      columns.map((col) => {
        const key =
          ("id" in col && col.id != null ? String(col.id) : null) ??
          ("accessorKey" in col && col.accessorKey != null
            ? String(col.accessorKey)
            : null);
        if (key === "id") return { ...col, enableHiding: false };
        return col;
      }),
    [columns],
  );

  const [columnPanelOpen, setColumnPanelOpen] = React.useState(false);
  const panelRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setColumnPanelOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const debouncedGlobalFilter = React.useMemo(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    return (value: string) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => setInternalGlobalFilter(value), 400);
    };
  }, []);

  const isEmptyFilter = (value: unknown) => {
    if (value === null || value === undefined || value === "") return true;
    if (typeof value === "object") {
      return Object.values(value as Record<string, unknown>).every(
        (v) => v === undefined || v === "",
      );
    }
    return false;
  };

  const isFilterActive = (value: unknown) => !isEmptyFilter(value);

  const handleColumnFilterChange = React.useCallback((columnId: string, value: unknown) => {
    onPaginationChange((p) => ({ ...p, pageIndex: 0 }));
    setInternalColumnFilters((prev) => {
      const filtered = prev.filter((f) => f.id !== columnId);
      if (isEmptyFilter(value)) return filtered;
      return [...filtered, { id: columnId, value }];
    });
  }, [onPaginationChange]);

  const table = useReactTable({
    data,
    columns: displayColumns,
    state: {
      pagination,
      globalFilter: resolvedGlobalFilter,
      columnFilters: resolvedColumnFilters,
      sorting: resolvedSorting,
      columnVisibility: resolvedColumnVisibility,
    },
    onPaginationChange,
    onGlobalFilterChange: setInternalGlobalFilter,
    onColumnFiltersChange: setInternalColumnFilters,
    onSortingChange: (updater) => {
      onPaginationChange((p) => ({ ...p, pageIndex: 0 }));
      setInternalSorting(updater);
    },
    onColumnVisibilityChange: (updater) => {
      setInternalColumnVisibility((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        return { ...next, id: false };
      });
    },
    enableColumnFilters,
    // Saving a row refetches data; that must not send the admin back to page 1.
    autoResetPageIndex: false,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination,
    manualSorting,
    manualFiltering,
    pageCount: manualPagination
      ? Math.ceil((totalItemsProp ?? data.length) / pagination.pageSize)
      : undefined,
  });

  // Tables never scroll sideways: show one only while every visible column fits.
  const visibleColumns = table.getVisibleLeafColumns();
  const requiredWidth = visibleColumns.reduce(
    (sum, column) => sum + columnWidth(column),
    0,
  );
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [showTable, setShowTable] = React.useState(false);
  React.useLayoutEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    // The 16px margin stops table and cards flipping around the threshold.
    const measure = () =>
      setShowTable(
        (shown) =>
          window.innerWidth >= 768 && node.clientWidth >= requiredWidth + (shown ? 0 : 16),
      );
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [requiredWidth, hidden]);

  const pageTotal = table.getPageCount();
  React.useLayoutEffect(() => {
    if (!manualPagination && pagination.pageIndex >= Math.max(pageTotal, 1)) {
      onPaginationChange((p) => ({ ...p, pageIndex: Math.max(pageTotal - 1, 0) }));
    }
  }, [manualPagination, pageTotal, pagination.pageIndex, onPaginationChange]);

  const sortableColumns = visibleColumns.filter((c) => c.getCanSort() && !isImageColumn(c.id));
  const activeSort = resolvedSorting[0];
  const hasActiveQuery = resolvedGlobalFilter !== "" || resolvedColumnFilters.length > 0;
  const clearFilters = () => {
    onPaginationChange((p) => ({ ...p, pageIndex: 0 }));
    setInternalGlobalFilter("");
    setInternalColumnFilters([]);
  };
  const emptyContent = hasActiveQuery ? (
    <div className="space-y-3">
      <p>{t("table.noResults", { query: resolvedGlobalFilter || "…" })}</p>
      <Button type="button" variant="outline" size="sm" onClick={clearFilters}>
        {t("table.clearFilters")}
      </Button>
    </div>
  ) : (
    t("table.noData")
  );

  const hasImageColumn = table.getVisibleLeafColumns().some((column) => isImageColumn(column.id));

  const filteredCount = table.getFilteredRowModel().rows.length;
  const totalItems = totalItemsProp ?? (manualPagination ? data.length : filteredCount);

  const getColumnFilterValue = (id: string) =>
    resolvedColumnFilters.find((f) => f.id === id)?.value;

  const hasAccessor = (column: Column<T, unknown>) => {
    const def = column.columnDef as { accessorKey?: unknown; accessorFn?: unknown };
    return def.accessorKey != null || typeof def.accessorFn === "function";
  };

  const canShowColumnFilter = (column: Column<T, unknown>) => {
    if (!enableColumnFilters || !column.getCanFilter()) return false;
    return hasAccessor(column);
  };

  const renderColumnFilter = (columnId: string, header: { column: Column<T, unknown> }) => {
    const filterValue = getColumnFilterValue(columnId);
    const custom = header.column.columnDef.meta?.filterComponent?.({
      column: header.column,
      value: filterValue,
      onFilterChange: (v: unknown) => handleColumnFilterChange(columnId, v),
    });
    if (custom) return custom;
    return (
      <DefaultTextColumnFilter
        value={filterValue}
        onFilterChange={(v) => handleColumnFilterChange(columnId, v)}
        placeholder={t("table.filterDefault", {
          column: String(header.column.columnDef.header ?? columnId),
        })}
      />
    );
  };

  const handleExport = async () => {
    const exportData = onExport
      ? await onExport()
      : (data as Record<string, unknown>[]);
    // Timestamps leave the panel in Oman time, like everything shown on screen.
    const omanRows = exportData.map((row) =>
      Object.fromEntries(
        Object.entries(row).map(([key, value]) => [
          key,
          typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value)
            ? toOmanInput(value).replace("T", " ")
            : value,
        ]),
      ),
    );
    const ws = XLSX.utils.json_to_sheet(omanRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, resolvedEntityName);
    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([buffer]),
      `${resolvedEntityName}-${omanYmd()}.xlsx`,
    );
  };

  const mobileFilterableHeaders = enableColumnFilters
    ? table
        .getHeaderGroups()
        .flatMap((hg) => hg.headers.filter((h) => canShowColumnFilter(h.column) && !isImageColumn(h.column.id)))
    : [];

  const pageCount = manualPagination
    ? Math.ceil(totalItems / pagination.pageSize)
    : table.getPageCount();

  if (hidden) return null;

  return (
    <div
      ref={containerRef}
      className={cn("min-w-0 w-full max-w-full", showTable ? "admin-card" : "space-y-4")}
    >
      <div
        className={cn(
          "flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between",
          showTable && "px-6 py-4",
        )}
      >
        <label className="relative block min-w-0 sm:max-w-sm sm:flex-1 md:min-w-72">
          <AppIcon
            icon={Search}
            size="sm"
            className="pointer-events-none absolute start-3.5 top-1/2 z-10 -translate-y-1/2 text-muted"
          />
          <TableInput
            aria-label={t("table.searchIn", { entity: resolvedEntityName })}
            placeholder={t("table.searchIn", { entity: resolvedEntityName })}
          value={resolvedGlobalFilter}
          onChange={(e) => {
            const value = e.target.value;
            if (manualFiltering) debouncedGlobalFilter(value);
            else {
              onPaginationChange((p) => ({ ...p, pageIndex: 0 }));
              setInternalGlobalFilter(value);
            }
          }}
          className="rounded-full border-border ps-10"
          />
        </label>

        <div className="flex flex-wrap items-stretch gap-2 sm:items-center sm:justify-end">
          {onRefresh && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="border border-border bg-card text-foreground hover:border-accent/40 hover:bg-accent/10 hover:!text-accent-dark"
              onClick={onRefresh}
            >
              <AppIcon icon={RefreshCw} size="xs" className="me-1.5" />
              {t("table.refresh")}
            </Button>
          )}

          {enableExport && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="border border-border bg-card text-foreground hover:border-accent/40 hover:bg-accent/10 hover:!text-accent-dark"
              onClick={() => void handleExport()}
            >
              <AppIcon icon={Download} size="xs" className="me-1.5" />
              {t("table.export")}
            </Button>
          )}

          <div
            className="relative"
            ref={panelRef}
            hidden={!showTable}
            onKeyDown={(e) => {
              if (e.key === "Escape") setColumnPanelOpen(false);
            }}
          >
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="border border-border bg-card text-foreground hover:border-accent/40 hover:bg-accent/10 hover:!text-accent-dark"
              aria-expanded={columnPanelOpen}
              onClick={() => setColumnPanelOpen((p) => !p)}
            >
              {t("table.columns")}
            </Button>

            {columnPanelOpen && (
              <div className="fixed inset-x-3 bottom-4 z-50 max-h-[min(24rem,70vh)] space-y-3 overflow-auto rounded-xl border border-border bg-card p-3 shadow-lg sm:absolute sm:inset-x-auto sm:bottom-auto sm:end-0 sm:top-full sm:mt-2 sm:max-h-64 sm:w-64">
                <div className="text-xs text-muted">{t("table.columnManagement")}</div>
                <div className="max-h-64 space-y-2 overflow-auto">
                  {table.getAllLeafColumns().map((column) => {
                    if (!column.getCanHide() || column.id === "id" || column.id === "actions") return null;
                    return (
                      <label
                        key={column.id}
                        className="flex min-h-11 cursor-pointer items-center justify-between text-sm md:min-h-8"
                      >
                        <span>{String(column.columnDef.header ?? column.id)}</span>
                        <input
                          type="checkbox"
                          checked={column.getIsVisible()}
                          onChange={() => column.toggleVisibility()}
                        />
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {onCreateClick && (
            <Button
              type="button"
              size="sm"
              className="!shadow-none"
              onClick={onCreateClick}
            >
              <AppIcon icon={Plus} size="xs" className="me-1.5" />
              {createLabel ?? t("table.create")}
            </Button>
          )}
        </div>
      </div>

      {globalFilterForm && (
        <div className="rounded-xl border border-border bg-background p-4">
          {globalFilterForm}
        </div>
      )}

      {mobileFilterableHeaders.length > 0 && (
        <details className="group admin-card" hidden={showTable}>
          <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-medium text-foreground [&::-webkit-details-marker]:hidden">
            {t("table.columnFilters")}
            <AppIcon icon={ChevronDown} size="xs" className="text-muted transition-transform group-open:rotate-180" />
          </summary>
          <div className="grid grid-cols-1 gap-3 border-t border-border p-4 sm:grid-cols-2">
          {mobileFilterableHeaders.map((header) => {
            const columnId = header.column.id;
            const filterValue = getColumnFilterValue(columnId);
            return (
              <div
                key={header.id}
                className="space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-muted">
                    {String(header.column.columnDef.header ?? columnId)}
                  </span>
                  {isFilterActive(filterValue) && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="!h-8 !px-2 text-xs"
                      onClick={() => handleColumnFilterChange(columnId, null)}
                    >
                      {t("table.clear")}
                    </Button>
                  )}
                </div>
                {renderColumnFilter(columnId, header)}
              </div>
            );
          })}
          </div>
        </details>
      )}

      {showTable ? (
        <div className="min-w-0 w-full border-t border-border">
          <table dir={tableDir} className="w-full table-fixed border-collapse">
            <colgroup>
              {visibleColumns.map((column) => (
                <col
                  key={column.id}
                  style={{
                    width: `${(columnWidth(column) / requiredWidth) * 100}%`,
                  }}
                />
              ))}
            </colgroup>
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((header) => {
                    const canSort = header.column.getCanSort();
                    const isSorted = header.column.getIsSorted();
                    const columnId = header.column.id;
                    const filterValue = getColumnFilterValue(columnId);

                    return (
                      <th
                        key={header.id}
                        aria-sort={
                          isSorted === "asc"
                            ? "ascending"
                            : isSorted === "desc"
                              ? "descending"
                              : undefined
                        }
                        className="group/th bg-[#f0f5f9]/80 px-4 py-3.5 text-start text-[11.5px] font-bold text-muted first:ps-6 last:pe-6 ltr:uppercase ltr:tracking-[.06em]"
                      >
                        <div className="flex min-w-0 items-center gap-1">
                          <button
                            type="button"
                            disabled={!canSort}
                            className={cn(
                              "flex min-w-0 items-center gap-1 text-start select-none",
                              canSort && "cursor-pointer hover:text-foreground",
                            )}
                            onClick={
                              canSort ? header.column.getToggleSortingHandler() : undefined
                            }
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {canSort && (
                              <AppIcon
                                icon={isSorted === "asc" ? ChevronUp : ChevronDown}
                                size="xs"
                                className={isSorted ? "" : "opacity-40"}
                              />
                            )}
                          </button>

                          {canShowColumnFilter(header.column) && (
                            <ColumnFilter
                              isActive={isFilterActive(filterValue)}
                              onClear={() => handleColumnFilterChange(columnId, null)}
                              title={t("table.filterDefault", {
                                column: String(
                                  header.column.columnDef.header ?? header.column.id,
                                ),
                              })}
                            >
                              {renderColumnFilter(columnId, header)}
                            </ColumnFilter>
                          )}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>

            <tbody className={cn(isSkeleton && "skeleton")}>
              {isSkeleton ? (
                Array.from({ length: SKELETON_ROWS }, (_, rowIndex) => (
                  <tr key={rowIndex} className="border-b border-border last:border-b-0">
                    <td colSpan={visibleColumns.length} className="px-6 py-3.5">
                      <div className={cn("target w-full rounded-lg", hasImageColumn ? "h-10" : "h-5")} />
                    </td>
                  </tr>
                ))
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={visibleColumns.length} className="h-48 text-center text-muted">
                    {emptyContent}
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-t"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-4 py-3.5 align-middle text-sm [overflow-wrap:anywhere] first:ps-6 last:pe-6"
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : isSkeleton ? (
        <div className="skeleton space-y-4" aria-busy>
          {sortableColumns.length > 0 ? <div className="target h-11 w-full rounded-xl" /> : null}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="admin-card h-36 overflow-hidden">
                <div className="target h-full w-full !rounded-none" />
              </div>
            ))}
          </div>
        </div>
      ) : table.getRowModel().rows.length === 0 ? (
        <div className="admin-card flex min-h-48 items-center justify-center p-4 text-center text-sm text-muted">
          {emptyContent}
        </div>
      ) : (
        <>
        {sortableColumns.length > 0 ? (
          <Select
            value={activeSort ? `${activeSort.id}:${activeSort.desc ? "desc" : "asc"}` : ""}
            aria-label={t("table.sortBy")}
            onChange={(e) => {
              const [id, dir] = e.target.value.split(":");
              onPaginationChange((p) => ({ ...p, pageIndex: 0 }));
              setInternalSorting(id ? [{ id, desc: dir === "desc" }] : []);
            }}
          >
            <option value="">{t("table.sortBy")}</option>
            {sortableColumns.flatMap((c) => [
              <option key={`${c.id}-asc`} value={`${c.id}:asc`}>{getColumnHeaderLabel(c)} ↑</option>,
              <option key={`${c.id}-desc`} value={`${c.id}:desc`}>{getColumnHeaderLabel(c)} ↓</option>,
            ])}
          </Select>
        ) : null}
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {table.getRowModel().rows.map((row) => {
            const cells = row.getVisibleCells();
            const actionCell = cells.find((cell) => cell.column.id === "actions");
            const imageCell = cells.find((cell) => isImageColumn(cell.column.id));
            const rest = cells.filter((cell) => cell !== actionCell && cell !== imageCell);
            const titleCell = rest[0];
            const detailCells = rest.slice(1);

            return (
              <li key={row.id} className="admin-card flex min-w-0 flex-col gap-3 p-4">
                <div className="flex min-w-0 items-center gap-3">
                  {imageCell ? (
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-background [&>div]:!h-full [&>div]:!w-full [&_img]:!object-cover">
                      {flexRender(imageCell.column.columnDef.cell, imageCell.getContext())}
                    </div>
                  ) : null}
                  {titleCell ? (
                    <div className="min-w-0 text-sm font-semibold [overflow-wrap:anywhere]">
                      {flexRender(titleCell.column.columnDef.cell, titleCell.getContext())}
                    </div>
                  ) : null}
                </div>
                {detailCells.length > 0 ? (
                  <dl className="space-y-2 border-t border-border pt-3">
                    {detailCells.map((cell) => (
                      <div key={cell.id} className="flex min-w-0 items-baseline justify-between gap-4">
                        <dt className="shrink-0 text-xs text-muted">
                          {getColumnHeaderLabel(cell.column)}
                        </dt>
                        <dd className="min-w-0 text-end text-sm [overflow-wrap:anywhere]">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </dd>
                      </div>
                    ))}
                  </dl>
                ) : null}
                {actionCell ? (
                  <div className="mt-auto flex justify-end border-t border-border pt-2">
                    {flexRender(actionCell.column.columnDef.cell, actionCell.getContext())}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
        </>
      )}

      <div
        className={cn(
          "flex flex-wrap items-center gap-3 text-sm text-muted",
          showTable && "border-t border-border px-6 py-3",
        )}
      >
        <span dir="auto">
          {t("table.showing")}{" "}
          {totalItems === 0 ? 0 : pagination.pageIndex * pagination.pageSize + 1}{" "}
          {t("table.to")}{" "}
          {Math.min((pagination.pageIndex + 1) * pagination.pageSize, totalItems)}{" "}
          {t("table.of")} {totalItems}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="hidden sm:inline">{t("table.pageSize")}</span>
          <span className="inline-flex rounded-full bg-background p-0.5">
            {pageSizeOptions.map((size) => (
              <button
                key={size}
                type="button"
                aria-pressed={pagination.pageSize === size}
                onClick={() =>
                  onPaginationChange((prev) => ({ ...prev, pageSize: size, pageIndex: 0 }))
                }
                className={cn(
                  "min-h-11 min-w-11 rounded-full px-2.5 text-xs font-semibold tabular-nums transition md:min-h-7 md:min-w-8",
                  pagination.pageSize === size
                    ? "bg-card text-accent-dark shadow-sm"
                    : "hover:text-foreground",
                )}
              >
                {size}
              </button>
            ))}
          </span>
        </span>
        <nav aria-label={t("table.pagination")} className="ms-auto flex items-center gap-1">
          <button
            type="button"
            aria-label={t("table.prev")}
            className="grid size-11 place-items-center rounded-full transition hover:bg-accent/10 hover:text-accent-dark disabled:pointer-events-none disabled:opacity-40 md:size-8"
            onClick={() => onPaginationChange((p) => ({ ...p, pageIndex: p.pageIndex - 1 }))}
            disabled={pagination.pageIndex === 0}
          >
            <AppIcon icon={tableDir === "rtl" ? ChevronRight : ChevronLeft} size="sm" />
          </button>
          {pageWindow(pagination.pageIndex, Math.max(pageCount, 1)).map((page, index) =>
            page === null ? (
              <span key={`gap-${index}`} className="px-1 text-xs">
                …
              </span>
            ) : (
              <button
                key={page}
                type="button"
                aria-current={page === pagination.pageIndex ? "page" : undefined}
                onClick={() => onPaginationChange((p) => ({ ...p, pageIndex: page }))}
                className={cn(
                  "grid min-h-11 min-w-11 place-items-center rounded-full px-2 text-xs font-semibold tabular-nums transition md:min-h-8 md:min-w-8",
                  // Keeps Next on screen at 375px: phones show first, current and last only.
                  Math.abs(page - pagination.pageIndex) === 1 &&
                    page !== 0 &&
                    page !== Math.max(pageCount, 1) - 1 &&
                    "max-md:hidden",
                  page === pagination.pageIndex
                    ? "bg-accent text-accent-foreground shadow-sm"
                    : "hover:bg-accent/10 hover:text-accent-dark",
                )}
              >
                {page + 1}
              </button>
            ),
          )}
          <button
            type="button"
            aria-label={t("table.next")}
            className="grid size-11 place-items-center rounded-full transition hover:bg-accent/10 hover:text-accent-dark disabled:pointer-events-none disabled:opacity-40 md:size-8"
            onClick={() => onPaginationChange((p) => ({ ...p, pageIndex: p.pageIndex + 1 }))}
            disabled={pagination.pageIndex >= pageCount - 1}
          >
            <AppIcon icon={tableDir === "rtl" ? ChevronLeft : ChevronRight} size="sm" />
          </button>
        </nav>
      </div>
    </div>
  );
}
