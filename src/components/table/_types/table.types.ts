import type { Column } from "@tanstack/react-table";

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData, TValue> {
    filterComponent?: (props: {
      column: Column<TData, TValue>;
      value: unknown;
      onFilterChange: (value: unknown) => void;
    }) => React.ReactNode;
    mobileLabel?: string;
  }
}

export type { ColumnDef, PaginationState, SortingState } from "@tanstack/react-table";
