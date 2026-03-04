import { ReactNode } from "react";

export type ColumnDefinition<T = any> = {
  key: string;
  label: string;
  sortKey?: string;
  sortType?: "string" | "number" | "date" | "boolean";
  className?: string;
  render?: (value: any, row: T, index: number) => ReactNode;
  renderHeader?: (data: T[], allDataLength: number) => ReactNode;
};

export type PaginationConfig<T = any> = {
  currentPage: number;
  totalPages: number;
  total: number;
  perPage: number;
  perPageOptions: { label: string; value: number }[];
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
};

export type SortConfig = {
  currentOrder?: string;
  onSort: (sortKey: string, order: string) => void;
  clientSide?: boolean;
};

export type DataTableConfig<T = any> = {
  columns: ColumnDefinition<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T, index: number) => void;
  rowClassName?: string | ((row: T, index: number) => string);
  tableClassName?: string;
};

export type SearchFieldBase = {
  name: string;
  label: string;
  type: "text" | "select" | "checkbox" | "date";
};

export type TextSearchField = SearchFieldBase & {
  type: "text";
  placeholder?: string;
};

export type SelectSearchField = SearchFieldBase & {
  type: "select";
  options: { label: string; value: any }[];
};

export type CheckboxSearchField = SearchFieldBase & {
  type: "checkbox";
  trueValue?: any;
  falseValue?: any;
};

export type DateSearchField = SearchFieldBase & {
  type: "date";
};

export type SearchField =
  | TextSearchField
  | SelectSearchField
  | CheckboxSearchField
  | DateSearchField;

export type SearchConfig<T = any> = {
  fields: SearchField[];
  searchParams: T;
  onSearch: (params: T) => void;
  onReset: () => void;
  onParamChange: (params: Partial<T>) => void;
};

export type ListPageConfig<TData = any, TSearchParams = any> = {
  title: string;
  icon: any;
  newButtonLabel?: string;
  newButtonHref?: string;
  tableConfig: DataTableConfig<TData>;
  searchConfig?: SearchConfig<TSearchParams>;
  paginationConfig?: PaginationConfig<TSearchParams>;
  sortConfig?: SortConfig;
};

export const DEFAULT_PER_PAGE_OPTIONS = [
  { label: "10件", value: 10 },
  { label: "20件", value: 20 },
  { label: "50件", value: 50 },
  { label: "100件", value: 100 },
  { label: "200件", value: 200 },
  { label: "500件", value: 500 },
];
