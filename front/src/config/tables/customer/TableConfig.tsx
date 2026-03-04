import React from "react";
import Image from "next/image";
import { ColumnDefinition } from "@/types/dataTable";
import { Customer } from "@/types/customer";
import Base64Support from "@/component/Widgets/Base64Support";

// context
import { useUser } from "@/contexts/UserContext";

const welfareCustomerTableColumns: ColumnDefinition<Customer>[] = [
  {
    key: "cd",
    label: "利用者番号",
    sortKey: "cd",
    sortType: "string",
  },
  {
    key: "image",
    label: "顔写真",
    className: "img",
    render: (value: string | null, row: Customer) => (
      <div className="img">
        {value ? (
          <Image
            width={50}
            height={50}
            src={Base64Support(value)}
            alt={row.name}
          />
        ) : (
          <Image
            width={50}
            height={50}
            src="/img/no_image.png"
            alt="No Image"
          />
        )}
      </div>
    ),
  },
  {
    key: "name",
    label: "利用者名",
  },
  {
    key: "name_kana",
    label: "フリガナ",
    sortKey: "name_kana",
    sortType: "string",
  },
  {
    key: "car_restriction",
    label: "車両制限",
  },
  {
    key: "contract_status",
    label: "契約識別",
  },
  {
    key: "wc",
    label: "車椅子",
    render: (value: boolean) => (value ? "あり" : "なし"),
  },
  {
    key: "walker",
    label: "歩行器",
    render: (value: boolean) => (value ? "あり" : "なし"),
  },
  {
    key: "stopped_at",
    label: "休止日",
    render: (value: string | null) => {
      if (!value) return "-";
      return new Date(value).toLocaleDateString("ja-JP");
    },
  },
];

const educationCustomerTableColumns: ColumnDefinition<Customer>[] = [
  {
    key: "cd",
    label: "利用者番号",
    sortKey: "cd",
    sortType: "string",
  },
  {
    key: "name",
    label: "利用者名",
  },
  {
    key: "name_kana",
    label: "フリガナ",
    sortKey: "name_kana",
    sortType: "string",
  },
  {
    key: "car_restriction",
    label: "車両制限",
  },
  {
    key: "phone_number",
    label: "電話番号",
  },
  {
    key: "stopped_at",
    label: "休止日",
    render: (value: string | null) => {
      if (!value) return "-";
      return new Date(value).toLocaleDateString("ja-JP");
    },
  },
];

export const useCustomerTableColumns = () => {
  const { category } = useUser();
  if (category === "welfare") return welfareCustomerTableColumns;
  if (category === "education") return educationCustomerTableColumns;
  return [];
};
