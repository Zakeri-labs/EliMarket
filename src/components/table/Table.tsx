"use client";

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

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

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
    setInternalColumnFilters((prev) => {
      const filtered = prev.filter((f) => f.id !== columnId);
      if (isEmptyFilter(value)) return filtered;
      return [...filtered, { id: columnId, value }];
    });
  }, []);

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
    onSortingChange: setInternalSorting,
    onColumnVisibilityChange: (updater) => {
      setInternalColumnVisibility((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        return { ...next, id: false };
      });
    },
    enableColumnFilters,
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
    (sum, column) => sum + (column.columnDef.meta?.minWidth ?? column.columnDef.size ?? 128),
    0,
  );
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [showTable, setShowTable] = React.useState(false);
  React.useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const measure = () =>
      setShowTable(window.innerWidth >= 768 && node.clientWidth >= requiredWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [requiredWidth]);

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
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, resolvedEntityName);
    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([buffer]),
      `${resolvedEntityName}-${new Date().toISOString().slice(0, 10)}.xlsx`,
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

  return (
    <div ref={containerRef} className="min-w-0 w-full max-w-full space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <TableInput
          placeholder={t("table.searchIn", { entity: resolvedEntityName })}
          value={resolvedGlobalFilter}
          onChange={(e) => {
            const value = e.target.value;
            if (manualFiltering) debouncedGlobalFilter(value);
            else setInternalGlobalFilter(value);
          }}
          className="rounded-full sm:max-w-md sm:flex-1 md:min-w-72"
        />

        <div className="flex flex-wrap items-stretch gap-2 sm:items-center sm:justify-end">
          {onRefresh && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-muted hover:bg-accent/10 hover:!text-accent-dark"
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
              className="text-muted hover:bg-accent/10 hover:!text-accent-dark"
              onClick={() => void handleExport()}
            >
              <AppIcon icon={Download} size="xs" className="me-1.5" />
              {t("table.export")}
            </Button>
          )}

          <div className="relative" ref={panelRef}>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="text-muted hover:bg-accent/10 hover:!text-accent-dark"
              onClick={() => setColumnPanelOpen((p) => !p)}
            >
              {t("table.columns")}
            </Button>

            {columnPanelOpen && (
              <div className="fixed inset-x-3 bottom-4 z-50 max-h-[min(24rem,70vh)] space-y-3 overflow-auto rounded-xl border border-border bg-white p-3 shadow-lg sm:absolute sm:inset-x-auto sm:bottom-auto sm:end-0 sm:top-full sm:mt-2 sm:max-h-64 sm:w-64">
                <div className="text-xs text-muted">{t("table.columnManagement")}</div>
                <div className="max-h-64 space-y-2 overflow-auto">
                  {table.getAllLeafColumns().map((column) => {
                    if (!column.getCanHide() || column.id === "id") return null;
                    return (
                      <label
                        key={column.id}
                        className="flex cursor-pointer justify-between text-sm"
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
        <div className="admin-card min-w-0 w-full">
          <table dir={tableDir} className="w-full table-fixed border-collapse">
            <colgroup>
              {visibleColumns.map((column) => (
                <col
                  key={column.id}
                  style={{
                    width: `${((column.columnDef.meta?.minWidth ?? column.columnDef.size ?? 128) / requiredWidth) * 100}%`,
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
                        className="group/th border-b border-border bg-background/60 px-4 py-3 text-start text-xs font-semibold text-muted first:rounded-ss-[18px] first:ps-6 last:rounded-se-[18px] last:pe-6"
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
                    {t("table.noData")}
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-border transition-colors last:border-b-0 hover:bg-accent/5"
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
        <div className="skeleton grid grid-cols-1 gap-3 sm:grid-cols-2" aria-busy>
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="admin-card h-36 overflow-hidden">
              <div className="target h-full w-full !rounded-none" />
            </div>
          ))}
        </div>
      ) : table.getRowModel().rows.length === 0 ? (
        <div className="admin-card flex min-h-48 items-center justify-center p-4 text-sm text-muted">
          {t("table.noData")}
        </div>
      ) : (
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
                      <div key={cell.id} className="flex min-w-0 items-start justify-between gap-4">
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
      )}

      <div className="flex flex-col gap-3 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-center sm:gap-4">
          <div className="text-center sm:text-start">
            {t("table.showing")}{" "}
            {totalItems === 0 ? 0 : pagination.pageIndex * pagination.pageSize + 1}{" "}
            {t("table.to")}{" "}
            {Math.min((pagination.pageIndex + 1) * pagination.pageSize, totalItems)}{" "}
            {t("table.of")} {totalItems}
          </div>
          <div className="flex items-center gap-2">
            <span className="whitespace-nowrap">{t("table.pageSize")}</span>
            <Select
              value={String(pagination.pageSize)}
              onChange={(e) => {
                const nextSize = Number(e.target.value);
                onPaginationChange((prev) => ({
                  ...prev,
                  pageSize: nextSize,
                  pageIndex: 0,
                }));
              }}
              className="!w-auto"
              aria-label={t("table.pageSize")}
            >
              {(pageSizeOptions.includes(pagination.pageSize)
                ? pageSizeOptions
                : [...pageSizeOptions, pagination.pageSize].sort((a, b) => a - b)
              ).map((size) => (
                <option key={size} value={String(size)}>
                  {size}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <nav aria-label={t("table.pageSize")} className="flex items-center justify-center gap-1 self-center rounded-full bg-card p-1 shadow-[var(--card-shadow)] sm:self-auto">
          <button
            type="button"
            aria-label={t("table.prev")}
            className="grid h-11 w-11 place-items-center rounded-full text-muted transition-colors hover:bg-background disabled:opacity-40 md:h-8 md:w-8"
            onClick={() => onPaginationChange((p) => ({ ...p, pageIndex: p.pageIndex - 1 }))}
            disabled={pagination.pageIndex === 0}
          >
            <AppIcon icon={tableDir === "rtl" ? ChevronRight : ChevronLeft} size="sm" />
          </button>
          <span className="min-w-14 text-center text-xs font-semibold text-foreground tabular-nums" aria-current="page">
            {pagination.pageIndex + 1} / {Math.max(pageCount, 1)}
          </span>
          <button
            type="button"
            aria-label={t("table.next")}
            className="grid h-11 w-11 place-items-center rounded-full text-muted transition-colors hover:bg-background disabled:opacity-40 md:h-8 md:w-8"
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
