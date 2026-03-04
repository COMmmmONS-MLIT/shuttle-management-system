import { ColumnDefinition } from "@/types/dataTable";
import { PointFormData } from "@/types/point";

export const pointTableColumns: ColumnDefinition<PointFormData>[] = [
  {
    key: "address_label",
    label: "地点名",
    sortKey: "address_label",
    sortType: "string",
  },
  {
    key: "address",
    label: "住所",
    sortKey: "address",
    sortType: "string",
  },
  {
    key: "postal_code",
    label: "郵便番号",
  },
  {
    key: "phone_number",
    label: "電話番号",
  },
  {
    key: "wait_time",
    label: "待ち時間",
    render: (value: number) => `${value}分`,
  },
  {
    key: "car_restriction_name",
    label: "車両制限",
  },
];