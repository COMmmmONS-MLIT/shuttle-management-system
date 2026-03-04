import React, { useMemo, useState } from "react";
import Sortable from "@/component/Widgets/Sortable";
import { DataTableConfig } from "@/types/dataTable";

type DataTableProps<T = any> = DataTableConfig<T> & {
  onSort?: (sortKey: string, order: string) => void;
  currentOrder?: string;
};

export default function DataTable<T = any>({
  columns,
  data,
  loading = false,
  onRowClick,
  rowClassName = "",
  tableClassName = "userTable",
  onSort,
  currentOrder,
}: DataTableProps<T>) {
  // クライアント側ソート用の状態
  const [clientSortKey, setClientSortKey] = useState<string>("");
  const [clientSortOrder, setClientSortOrder] = useState<"asc" | "desc">("asc");

  // クライアント側ソート関数
  const sortData = (
    data: T[],
    sortKey: string,
    order: "asc" | "desc",
    sortType?: string
  ) => {
    return [...data].sort((a, b) => {
      const aValue = a[sortKey as keyof T];
      const bValue = b[sortKey as keyof T];

      // null/undefined の処理
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return order === "asc" ? 1 : -1;
      if (bValue == null) return order === "asc" ? -1 : 1;

      let result = 0;

      switch (sortType) {
        case "number":
          result = Number(aValue) - Number(bValue);
          break;
        case "date":
          result =
            new Date(aValue as string).getTime() -
            new Date(bValue as string).getTime();
          break;
        case "boolean":
          result = (aValue ? 1 : 0) - (bValue ? 1 : 0);
          break;
        default: // string
          result = String(aValue).localeCompare(String(bValue), "ja");
          break;
      }

      return order === "desc" ? -result : result;
    });
  };

  // ソート済みデータ
  const sortedData = useMemo(() => {
    if (!clientSortKey) {
      return data;
    }

    const column = columns.find((col) => col.sortKey === clientSortKey);
    return sortData(data, clientSortKey, clientSortOrder, column?.sortType);
  }, [data, clientSortKey, clientSortOrder, columns]);
  const renderHeaderCell = (column: any, index: number) => {
    // カスタムヘッダーレンダリング
    if (column.renderHeader) {
      return (
        <th key={column.key || index}>
          {column.renderHeader(data, data.length)}
        </th>
      );
    }

    // サーバーサイドソート
    if (column.sortKey && onSort) {
      const isActive = currentOrder?.startsWith(column.sortKey);
      const order = isActive ? currentOrder?.split("_")[1] : "";
      return (
        <Sortable
          key={column.sortKey}
          label={column.label}
          sortKey={column.sortKey}
          currentOrder={isActive ? currentOrder || "" : ""}
          onChange={(newOrder) => {
            onSort(column.sortKey, newOrder);
          }}
        />
      );
    }

    // クライアントサイドソート
    if (column.sortKey) {
      return (
        <Sortable
          key={column.sortKey}
          label={column.label}
          sortKey={column.sortKey}
          currentOrder={
            clientSortKey === column.sortKey
              ? `${clientSortKey}_${clientSortOrder}`
              : ""
          }
          onChange={(newOrder) => {
            const lastUnderscoreIndex = newOrder.lastIndexOf("_");
            const order = newOrder.substring(lastUnderscoreIndex + 1);
            setClientSortKey(column.sortKey);
            setClientSortOrder(order as "asc" | "desc");
          }}
        />
      );
    }

    return <th key={column.key || index}>{column.label}</th>;
  };

  const renderCell = (column: any, row: T, rowIndex: number) => {
    if (column.render) {
      return column.render(row[column.key as keyof T], row, rowIndex);
    }

    const value = row[column.key as keyof T];
    return value !== null && value !== undefined ? String(value) : "";
  };

  const getRowClassName = (row: T, index: number) => {
    if (typeof rowClassName === "function") {
      return rowClassName(row, index);
    }
    return rowClassName;
  };

  if (loading) {
    return (
      <div className="viewport js-scroll">
        <table className={tableClassName}>
          <thead>
            <tr>{columns.map(renderHeaderCell)}</tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={columns.length}>読み込み中...</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="viewport js-scroll">
        <table className={tableClassName}>
          <thead>
            <tr>{columns.map(renderHeaderCell)}</tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={columns.length}>-</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="viewport js-scroll">
      <table className={tableClassName}>
        <thead>
          <tr>{columns.map(renderHeaderCell)}</tr>
        </thead>
        <tbody>
          {sortedData.map((row, index) => (
            <tr
              key={index}
              className={getRowClassName(row, index)}
              onClick={onRowClick ? () => onRowClick(row, index) : undefined}
              style={{
                cursor: onRowClick ? "pointer" : "default",
              }}
            >
              {columns.map((column, colIndex) => (
                <td key={column.key || colIndex} className={column.className}>
                  {renderCell(column, row, index)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
