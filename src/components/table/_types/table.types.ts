import type { Column } from "@tanstack/react-table";

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData, TValue> {
    filterComponent?: (props: {
      column: Column<TData, TValue>;
      value: unknown;
      onFilterChange: (value: unknown) => void;
    }) => React.ReactNode;
    mobileLabel?: string;
    /** Smallest width this column can stay readable at; decides table vs cards. */
    minWidth?: number;
  }
}

export type { ColumnDef, PaginationState, SortingState } from "@tanstack/react-table";
