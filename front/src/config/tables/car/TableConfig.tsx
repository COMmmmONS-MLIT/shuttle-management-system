import { ColumnDefinition } from "@/types/dataTable";
import { Car } from "@/types/car";

export const carTableColumns: ColumnDefinition<Car>[] = [
  {
    key: "number",
    label: "車両番号",
    sortKey: "number",
    sortType: "string",
  },
  {
    key: "name",
    label: "車両名",
    sortKey: "name",
    sortType: "string",
  },
  {
    key: "car_pattern_name",
    label: "車両パターン名",
  },
  {
    key: "max_seat",
    label: "最大乗車人数",
    sortKey: "max_seat",
    sortType: "number",
  },
  {
    key: "max_wc_seat",
    label: "最大車椅子数",
    sortKey: "max_wc_seat",
    sortType: "number",
  },
  {
    key: "stopped",
    label: "ステータス",
    sortKey: "stopped",
    sortType: "boolean",
    render: (value: boolean) => (value ? "停止中" : "稼働中"),
  },
];
