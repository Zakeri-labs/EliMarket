"use client";

import * as React from "react";
import {
  type Column,
  type ColumnDef,
  type ColumnFiltersState,
  type ColumnSizingState,
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
  enableColumnResizing?: boolean;
  columnSizingStorageKey?: string;
  pageSizeOptions?: number[];
  maxBodyHeight?: string;
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

function readStoredColumnSizing(key: string): ColumnSizingState {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as ColumnSizingState;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function resolveColumnSizingStorageKey(
  entityName?: string,
  explicit?: string,
): string | undefined {
  if (explicit) return explicit;
  if (!entityName) return undefined;
  return `elimarket-column-sizing:${entityName}`;
}

function attachHoverWheelScroll(el: HTMLElement | null): () => void {
  if (!el) return () => {};
  const onWheel = (e: WheelEvent) => {
    const canScrollY = el.scrollHeight > el.clientHeight + 1;
    const canScrollX = el.scrollWidth > el.clientWidth + 1;
    if (!canScrollY && !canScrollX) return;

    const deltaY = e.deltaY;
    const deltaX = e.deltaX !== 0 ? e.deltaX : e.shiftKey ? e.deltaY : 0;
    let handled = false;

    if (canScrollY && deltaY !== 0 && !e.shiftKey) {
      const atTop = el.scrollTop <= 0;
      const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
      if ((deltaY < 0 && !atTop) || (deltaY > 0 && !atBottom)) {
        el.scrollTop += deltaY;
        handled = true;
      }
    }

    if (canScrollX && deltaX !== 0) {
      const atStart = el.scrollLeft <= 0;
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1;
      if ((deltaX < 0 && !atStart) || (deltaX > 0 && !atEnd)) {
        el.scrollLeft += deltaX;
        handled = true;
      }
    }

    if (handled) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  el.addEventListener("wheel", onWheel, { passive: false });
  return () => el.removeEventListener("wheel", onWheel);
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
  enableColumnResizing = true,
  columnSizingStorageKey,
  pageSizeOptions = [...DEFAULT_PAGE_SIZE_OPTIONS],
  maxBodyHeight = "min(65vh, 36rem)",
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

  const desktopScrollRef = React.useRef<HTMLDivElement>(null);
  const mobileScrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => attachHoverWheelScroll(desktopScrollRef.current), []);
  React.useEffect(() => attachHoverWheelScroll(mobileScrollRef.current), []);

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

  const resolvedColumnSizingStorageKey = React.useMemo(
    () =>
      enableColumnResizing
        ? resolveColumnSizingStorageKey(entityName, columnSizingStorageKey)
        : undefined,
    [enableColumnResizing, entityName, columnSizingStorageKey],
  );

  const [columnPanelOpen, setColumnPanelOpen] = React.useState(false);
  const [columnSizing, setColumnSizing] = React.useState<ColumnSizingState>(() =>
    resolvedColumnSizingStorageKey
      ? readStoredColumnSizing(resolvedColumnSizingStorageKey)
      : {},
  );
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

  const handleColumnSizingChange: OnChangeFn<ColumnSizingState> = React.useCallback(
    (updater) => {
      setColumnSizing((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        if (resolvedColumnSizingStorageKey && typeof window !== "undefined") {
          try {
            localStorage.setItem(resolvedColumnSizingStorageKey, JSON.stringify(next));
          } catch {
            /* ignore */
          }
        }
        return next;
      });
    },
    [resolvedColumnSizingStorageKey],
  );

  const table = useReactTable({
    data,
    columns: displayColumns,
    defaultColumn: enableColumnResizing
      ? { minSize: 56, size: 128, maxSize: 720 }
      : undefined,
    state: {
      pagination,
      globalFilter: resolvedGlobalFilter,
      columnFilters: resolvedColumnFilters,
      sorting: resolvedSorting,
      columnVisibility: resolvedColumnVisibility,
      ...(enableColumnResizing ? { columnSizing } : {}),
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
    ...(enableColumnResizing ? { onColumnSizingChange: handleColumnSizingChange } : {}),
    enableColumnFilters,
    enableColumnResizing,
    columnResizeMode: "onChange",
    columnResizeDirection: tableDir === "rtl" ? "rtl" : "ltr",
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

  // Cells are whitespace-nowrap + clipped when resizable, so long values
  // (product names, etc.) can get cut off with no way to read the rest.
  // Give those a title tooltip — only when the column has a plain
  // string/number accessor, since e.g. the actions column has no accessor
  // at all and calling getValue() on it throws.
  const getCellTitle = (cell: { column: Column<T, unknown>; getValue: () => unknown }) => {
    if (!hasAccessor(cell.column)) return undefined;
    const value = cell.getValue();
    return typeof value === "string" || typeof value === "number" ? String(value) : undefined;
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
        .flatMap((hg) => hg.headers.filter((h) => canShowColumnFilter(h.column)))
    : [];

  const pageCount = manualPagination
    ? Math.ceil(totalItems / pagination.pageSize)
    : table.getPageCount();

  return (
    <div className="min-w-0 w-full max-w-full space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <TableInput
          placeholder={t("table.searchIn", { entity: resolvedEntityName })}
          value={resolvedGlobalFilter}
          onChange={(e) => {
            const value = e.target.value;
            if (manualFiltering) debouncedGlobalFilter(value);
            else setInternalGlobalFilter(value);
          }}
          className="min-h-9 sm:max-w-md sm:flex-1 md:min-w-72"
        />

        <div className="flex flex-wrap items-stretch gap-2 sm:items-center sm:justify-end">
          {onRefresh && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-[#e4e4e7] text-[#71717a]"
              onClick={onRefresh}
            >
              <AppIcon icon={RefreshCw} size="xs" className="me-1.5" />
              {t("table.refresh")}
            </Button>
          )}

          {enableExport && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-[#e4e4e7] text-[#71717a]"
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
              variant="outline"
              className="border-[#e4e4e7] text-[#71717a]"
              onClick={() => setColumnPanelOpen((p) => !p)}
            >
              {t("table.columns")}
            </Button>

            {columnPanelOpen && (
              <div className="fixed inset-x-3 bottom-4 z-50 max-h-[min(24rem,70vh)] space-y-3 overflow-auto rounded-xl border border-[#e4e4e7] bg-white p-3 shadow-lg sm:absolute sm:inset-x-auto sm:bottom-auto sm:end-0 sm:top-full sm:mt-2 sm:max-h-64 sm:w-64">
                <div className="text-xs text-[#71717a]">{t("table.columnManagement")}</div>
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
              onClick={onCreateClick}
            >
              <AppIcon icon={Plus} size="xs" className="me-1.5" />
              {createLabel ?? t("table.create")}
            </Button>
          )}
        </div>
      </div>

      {globalFilterForm && (
        <div className="rounded-xl border border-[#e4e4e7] bg-[#fafafa] p-4">
          {globalFilterForm}
        </div>
      )}

      {mobileFilterableHeaders.length > 0 && (
        <div className="space-y-3 rounded-xl border border-[#e4e4e7] bg-[#fafafa] p-3 md:hidden">
          <div className="text-xs font-semibold text-[#18181b]">{t("table.columnFilters")}</div>
          {mobileFilterableHeaders.map((header) => {
            const columnId = header.column.id;
            const filterValue = getColumnFilterValue(columnId);
            return (
              <div
                key={header.id}
                className="space-y-2 border-b border-[#e4e4e7]/80 pb-3 last:border-b-0 last:pb-0"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-[#71717a]">
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
      )}

      <div className="hidden min-w-0 w-full max-w-full md:block">
        <div
          ref={desktopScrollRef}
          className="admin-thin-scroll max-w-full overflow-auto overscroll-contain rounded-xl bg-white"
          style={{
            maxHeight: maxBodyHeight,
            border: "2px solid #6b8f71",
            scrollbarWidth: "thin",
            scrollbarColor: "#6b8f71 #f4f4f5",
          }}
        >
          <table
            dir={tableDir}
            className={cn(
              enableColumnResizing
                ? "table-fixed border-collapse min-w-full"
                : "w-max min-w-full",
            )}
            style={
              enableColumnResizing
                ? {
                    width: table.getCenterTotalSize(),
                    minWidth: `max(100%, ${table.getCenterTotalSize()}px)`,
                  }
                : undefined
            }
          >
            <thead className="sticky top-0 z-20 bg-[#f4f4f5]">
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((header, headerIndex) => {
                    const canSort = header.column.getCanSort();
                    const isSorted = header.column.getIsSorted();
                    const columnId = header.column.id;
                    const filterValue = getColumnFilterValue(columnId);
                    const canResize = enableColumnResizing && header.column.getCanResize();
                    const isLastHeader = headerIndex === hg.headers.length - 1;

                    return (
                      <th
                        key={header.id}
                        className={cn(
                          "relative border-b border-[#e4e4e7] bg-[#f4f4f5] px-4 py-2.5 text-start text-xs whitespace-nowrap text-[#527559]",
                          enableColumnResizing && "border-e border-[#e4e4e7]",
                        )}
                        style={
                          enableColumnResizing
                            ? { width: header.getSize(), minWidth: header.getSize() }
                            : undefined
                        }
                      >
                        <div className="flex min-w-0 items-center gap-2 overflow-hidden">
                          <button
                            type="button"
                            className={cn(
                              "flex items-center gap-1 select-none",
                              canSort
                                ? "cursor-pointer hover:text-[#18181b]"
                                : "cursor-default",
                            )}
                            onClick={
                              canSort ? header.column.getToggleSortingHandler() : undefined
                            }
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {canSort && (
                              <AppIcon
                                icon={
                                  isSorted === "asc"
                                    ? ChevronUp
                                    : ChevronDown
                                }
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

                        {canResize && (
                          <button
                            type="button"
                            aria-label={t("table.resizeColumn", {
                              column: String(header.column.columnDef.header ?? columnId),
                            })}
                            onMouseDown={header.getResizeHandler()}
                            onTouchStart={header.getResizeHandler()}
                            onDoubleClick={() => header.column.resetSize()}
                            className={cn(
                              "absolute top-0 bottom-0 end-0 z-10 w-2 cursor-col-resize touch-none select-none bg-transparent hover:bg-[#6b8f71]/25 active:bg-[#6b8f71]/40",
                              // Straddling the border (translate-x-1/2) makes the handle
                              // easier to grab, but on the last column it pushes 4px past
                              // the table's own edge — enough for the scroll container to
                              // treat it as real overflow and show a phantom scrollbar.
                              !isLastHeader && "translate-x-1/2",
                              header.column.getIsResizing() && "bg-[#6b8f71]/40",
                            )}
                          />
                        )}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>

            <tbody className={cn(isSkeleton && "skeleton")}>
              {table.getRowModel().rows.length === 0 && !isSkeleton ? (
                <tr>
                  <td colSpan={columns.length} className="h-48 text-center text-[#71717a]">
                    {t("table.noData")}
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className={cn(
                      "border-b border-[#e4e4e7]/80 transition-colors even:bg-[#fafafa] hover:bg-[#6b8f71]/5",
                      isSkeleton && "pointer-events-none",
                    )}
                    aria-busy={isSkeleton}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        title={getCellTitle(cell)}
                        className={cn(
                          "px-4 py-2.5 text-sm whitespace-nowrap text-ellipsis",
                          enableColumnResizing && "overflow-hidden border-e border-[#e4e4e7]/60",
                        )}
                        style={
                          enableColumnResizing
                            ? { width: cell.column.getSize(), minWidth: cell.column.getSize() }
                            : undefined
                        }
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
      </div>

      <div
        ref={mobileScrollRef}
        className="admin-thin-scroll space-y-3 overflow-y-auto overscroll-contain md:hidden"
        style={{
          maxHeight: maxBodyHeight,
          scrollbarWidth: "thin",
          scrollbarColor: "#6b8f71 #f4f4f5",
        }}
      >
        {table.getRowModel().rows.length === 0 && !isSkeleton ? (
          <div className="flex min-h-48 items-center justify-center rounded-2xl border border-[#e4e4e7] bg-white p-4 text-sm text-[#71717a]">
            {t("table.noData")}
          </div>
        ) : (
          table.getRowModel().rows.map((row) => {
            const cells = row.getVisibleCells();
            const actionCell = cells.find((cell) => cell.column.id === "actions");
            const dataCells = cells.filter((cell) => cell.column.id !== "actions");

            return (
              <article
                key={row.id}
                className={cn(
                  "rounded-2xl border border-[#e4e4e7] bg-white p-4 shadow-sm",
                  isSkeleton && "skeleton pointer-events-none",
                )}
                aria-busy={isSkeleton}
              >
                <dl className="space-y-3">
                  {dataCells.map((cell) => (
                    <div key={cell.id} className="min-w-0">
                      <dt className="text-[11px] font-medium text-[#71717a]">
                        {getColumnHeaderLabel(cell.column)}
                      </dt>
                      <dd className="mt-1 min-w-0 text-sm leading-relaxed text-[#18181b] [overflow-wrap:anywhere]">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </dd>
                    </div>
                  ))}
                </dl>
                {actionCell ? (
                  <div className="mt-3 flex justify-end border-t border-[#e4e4e7] pt-3">
                    {flexRender(actionCell.column.columnDef.cell, actionCell.getContext())}
                  </div>
                ) : null}
              </article>
            );
          })
        )}
      </div>

      <div className="flex flex-col gap-3 text-sm text-[#71717a] sm:flex-row sm:items-center sm:justify-between">
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
            <select
              value={String(pagination.pageSize)}
              onChange={(e) => {
                const nextSize = Number(e.target.value);
                onPaginationChange((prev) => ({
                  ...prev,
                  pageSize: nextSize,
                  pageIndex: 0,
                }));
              }}
              className="h-8 rounded-lg border border-[#e4e4e7] bg-white px-2 text-sm"
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
            </select>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-2 sm:justify-end">
          <Button
            type="button"
            size="sm"
            onClick={() =>
              onPaginationChange((p) => ({ ...p, pageIndex: p.pageIndex - 1 }))
            }
            disabled={pagination.pageIndex === 0}
          >
            {t("table.prev")}
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() =>
              onPaginationChange((p) => ({ ...p, pageIndex: p.pageIndex + 1 }))
            }
            disabled={pagination.pageIndex >= pageCount - 1}
          >
            {t("table.next")}
          </Button>
        </div>
      </div>
    </div>
  );
}
