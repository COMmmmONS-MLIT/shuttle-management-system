import { ColumnDefinition } from "@/types/dataTable";
import { Staffs } from "@/types/staff";

export const staffTableColumns: ColumnDefinition<Staffs>[] = [
  {
    key: "cd",
    label: "職員ID",
    sortKey: "cd",
    sortType: "string",
  },
  {
    key: "name",
    label: "職員名",
  },
  {
    key: "name_kana",
    label: "フリガナ",
    sortKey: "name_kana",
    sortType: "string",
  },
  {
    key: "category",
    label: "職種カテゴリ",
  },
  {
    key: "can_driver",
    label: "運転可能",
    render: (value: boolean) => (value ? "可能" : "不可"),
  },
  {
    key: "can_helper",
    label: "添乗可能",
    render: (value: boolean) => (value ? "可能" : "不可"),
  },
  {
    key: "driver_type",
    label: "運転手区分",
  },
  {
    key: "is_stopped",
    label: "ステータス",
    render: (value: boolean) => (value ? "停止中" : "稼働中"),
  },
];
