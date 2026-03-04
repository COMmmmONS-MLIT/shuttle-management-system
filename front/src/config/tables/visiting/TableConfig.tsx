import React from "react";
import { ColumnDefinition } from "@/types/dataTable";
import {
  VisitingsCustomerPair,
  RequestedVisitingsCustomer,
  TourismVisitingsCustomer,
  EducationVisitingsCustomer,
} from "@/types/visitingsCustomer";
import RequestedCustomer from "@/types/requestedCustomer";
import CheckboxField from "@/component/FormControls/CheckboxField";
import SogeType from "@/component/Widgets/SogeType";
import { postRequestCancellation } from "@/component/Dashboard/RequestedCustomers/postRequestCancellation";
export const visitingTableColumns = (
  selectedCustomers: Set<number>,
  handleSelectAll: (checked: boolean) => void,
  handleBulkRequest: () => void,
  handleIndividualCheckbox: (index: number, checked: boolean) => void,
  canRequest: boolean = false,
): ColumnDefinition<VisitingsCustomerPair>[] => [
  {
    key: "customer_cd",
    label: "利用者番号",
    sortKey: "customer_cd",
    sortType: "string",
  },
  {
    key: "date",
    label: "日付",
    sortKey: "date",
    sortType: "string",
  },
  {
    key: "customer_name",
    label: "利用者名",
  },
  {
    key: "customer_kana",
    label: "フリガナ",
    sortKey: "customer_kana",
    sortType: "string",
  },
  {
    key: "departure_time",
    label: "迎え時間",
    sortKey: "departure_time",
    sortType: "string",
  },
  {
    key: "start_time",
    label: "開始時間",
    sortKey: "start_time",
    sortType: "string",
  },
  {
    key: "arrival_time",
    label: "送り時間",
    sortKey: "arrival_time",
    sortType: "string",
  },
  {
    key: "self_transport",
    label: "自来/自退",
    render: (value: any, row: VisitingsCustomerPair) => {
      const parts = [];
      if (row.self_pick_up) parts.push("自来");
      if (row.self_drop_off) parts.push("自退");
      return parts.join("");
    },
  },
  {
    key: "is_absent",
    label: "休み",
    sortKey: "is_absent",
    sortType: "boolean",
    render: (value: boolean, row: VisitingsCustomerPair) => (
      <CheckboxField checked={!!row.is_absent} setState={() => {}} label="" />
    ),
  },
  {
    key: "absence_reason",
    label: "休み理由",
    sortKey: "absence_reason",
    sortType: "string",
  },
  ...(canRequest
    ? [
        {
          key: "checkbox",
          label: "",
          renderHeader: (
            data: VisitingsCustomerPair[],
            allDataLength: number,
          ) => {
            const selectableCustomers = data.filter(
              (c) => !(c as any).is_requested && c.can_request,
            );
            return selectableCustomers.length > 0 ? (
              <div style={{ display: "flex", alignItems: "center" }}>
                <CheckboxField
                  checked={
                    selectedCustomers.size === selectableCustomers.length &&
                    selectableCustomers.length > 0
                  }
                  setState={handleSelectAll}
                />
                <button
                  style={{ fontSize: "12px", fontWeight: "bold" }}
                  onClick={handleBulkRequest}
                  disabled={selectedCustomers.size === 0}
                >
                  送迎リクエストを送信
                </button>
              </div>
            ) : null;
          },
          render: (value: any, row: VisitingsCustomerPair, index: number) => {
            if ((row as any).is_requested) {
              return null;
            }
            if (!row.can_request) {
              return null;
            }
            return (
              <div onClick={(e) => e.stopPropagation()}>
                <CheckboxField
                  checked={selectedCustomers.has(index)}
                  setState={(checked: boolean) =>
                    handleIndividualCheckbox(index, checked)
                  }
                />
              </div>
            );
          },
        },
      ]
    : []),
];

export const requestedVisitingTableColumns: ColumnDefinition<RequestedVisitingsCustomer>[] =
  [
    {
      key: "soge_type",
      label: "送迎タイプ",
      sortKey: "soge_type",
      sortType: "string",
      render: (value: string) => SogeType(value),
    },
    {
      key: "office_name",
      label: "事業所名",
      sortKey: "office_name",
      sortType: "string",
    },
    {
      key: "customer_name",
      label: "利用者名",
      sortKey: "customer_name",
      sortType: "string",
    },
    {
      key: "customer_kana",
      label: "利用者名カナ",
      sortKey: "customer_kana",
      sortType: "string",
    },
    {
      key: "schedule_time",
      label: "予定時間",
      sortKey: "schedule_time",
      sortType: "string",
    },
    {
      key: "start_time",
      label: "開始時間",
      sortKey: "start_time",
      sortType: "string",
    },
    {
      key: "address",
      label: "住所",
      sortKey: "address",
      sortType: "string",
    },
  ];

export const createTourismTableColumns = (
  selectedCustomers: Set<number>,
  handleSelectAll: (checked: boolean) => void,
  handleBulkRequest: () => void,
  handleIndividualCheckbox: (index: number, checked: boolean) => void,
  canRequest: boolean = false,
): ColumnDefinition<TourismVisitingsCustomer>[] => [
  {
    key: "soge_type",
    label: "送迎タイプ",
    render: (value: string) => SogeType(value),
  },
  {
    key: "date",
    label: "日付",
    sortKey: "date",
    sortType: "string",
  },
  {
    key: "office_name",
    label: "事業所",
  },
  {
    key: "name",
    label: "利用者",
  },
  {
    key: "name_kana",
    label: "フリガナ",
    sortKey: "name_kana",
    sortType: "string",
  },
  {
    key: "phone_number",
    label: "電話番号",
  },
  {
    key: "passenger_count",
    label: "人数",
  },
  {
    key: "schedule_time",
    label: "予定時間",
    sortKey: "schedule_time",
    sortType: "string",
  },
  ...(canRequest
    ? [
        {
          key: "checkbox",
          label: "",
          renderHeader: (
            data: TourismVisitingsCustomer[],
            allDataLength: number,
          ) => {
            const selectableCustomers = data.filter(
              (c) => !c.is_requested && c.can_request,
            );
            return selectableCustomers.length > 0 ? (
              <div style={{ display: "flex", alignItems: "center" }}>
                <CheckboxField
                  checked={
                    selectedCustomers.size === selectableCustomers.length &&
                    selectableCustomers.length > 0
                  }
                  setState={handleSelectAll}
                />
                <button
                  style={{ fontSize: "12px", fontWeight: "bold" }}
                  onClick={handleBulkRequest}
                  disabled={selectedCustomers.size === 0}
                >
                  送迎リクエストを送信
                </button>
              </div>
            ) : null;
          },
          render: (
            value: any,
            row: TourismVisitingsCustomer,
            index: number,
          ) => {
            if (row.is_requested) {
              return null;
            }
            if (!row.can_request) {
              return null;
            }
            return (
              <div onClick={(e) => e.stopPropagation()}>
                <CheckboxField
                  checked={selectedCustomers.has(index)}
                  setState={(checked: boolean) =>
                    handleIndividualCheckbox(index, checked)
                  }
                />
              </div>
            );
          },
        },
      ]
    : []),
];

export const createEducationTableColumns = (
  selectedCustomers: Set<number>,
  handleSelectAll: (checked: boolean) => void,
  handleBulkRequest: () => void,
  handleIndividualCheckbox: (index: number, checked: boolean) => void,
  canRequest: boolean = false,
): ColumnDefinition<EducationVisitingsCustomer>[] => [
  {
    key: "soge_type",
    label: "送迎タイプ",
    render: (value: string) => SogeType(value),
  },
  {
    key: "date",
    label: "日付",
    sortKey: "date",
    sortType: "string",
  },
  {
    key: "office_name",
    label: "事業所",
  },
  {
    key: "name",
    label: "利用者",
  },
  {
    key: "name_kana",
    label: "フリガナ",
    sortKey: "name_kana",
    sortType: "string",
  },
  {
    key: "phone_number",
    label: "電話番号",
  },
  {
    key: "schedule_time",
    label: "予定時間",
    sortKey: "schedule_time",
    sortType: "string",
  },
  ...(canRequest
    ? [
        {
          key: "checkbox",
          label: "",
          renderHeader: (
            data: EducationVisitingsCustomer[],
            allDataLength: number,
          ) => {
            const selectableCustomers = data.filter(
              (c) => !c.is_requested && c.can_request,
            );
            return selectableCustomers.length > 0 ? (
              <div style={{ display: "flex", alignItems: "center" }}>
                <CheckboxField
                  checked={
                    selectedCustomers.size === selectableCustomers.length &&
                    selectableCustomers.length > 0
                  }
                  setState={handleSelectAll}
                />
                <button
                  style={{ fontSize: "12px", fontWeight: "bold" }}
                  onClick={handleBulkRequest}
                  disabled={selectedCustomers.size === 0}
                >
                  送迎リクエストを送信
                </button>
              </div>
            ) : null;
          },
          render: (
            value: any,
            row: EducationVisitingsCustomer,
            index: number,
          ) => {
            if (row.is_requested) {
              return null;
            }
            if (!row.can_request) {
              return null;
            }
            return (
              <div onClick={(e) => e.stopPropagation()}>
                <CheckboxField
                  checked={selectedCustomers.has(index)}
                  setState={(checked: boolean) =>
                    handleIndividualCheckbox(index, checked)
                  }
                />
              </div>
            );
          },
        },
      ]
    : []),
];

export const createRequestingCustomersTableColumns = (
  selectedRequestingCustomers: Set<number>,
  handleSelectAllRequesting: (checked: boolean) => void,
  cancelRequests: () => void,
  handleIndividualRequestingCheckbox: (index: number, checked: boolean) => void,
  showCancelButton: boolean,
  showDateColumn: boolean,
  onCancellationSuccess?: () => void,
): ColumnDefinition<RequestedCustomer>[] => {
  const baseColumns: ColumnDefinition<RequestedCustomer>[] = [
    {
      key: "soge_type",
      label: "送迎タイプ",
      render: (value: string) => SogeType(value),
    },
  ];

  if (showDateColumn) {
    baseColumns.push({
      key: "date",
      label: "日付",
    });
  }

  baseColumns.push(
    {
      key: "name",
      label: "利用者名",
    },
    {
      key: "schedule_time",
      label: "予定時間",
    },
    {
      key: "departure_time",
      label: "出発時間",
    },
    {
      key: "arrival_time",
      label: "到着時間",
    },
  );

  if (showCancelButton) {
    baseColumns.push({
      key: "checkbox",
      label: "",
      renderHeader: (data: RequestedCustomer[]) => {
        const selectableCount = data.filter(
          (customer) => !customer.allowing_office_id,
        ).length;
        return selectableCount > 0 ? (
          <div style={{ display: "flex", alignItems: "center" }}>
            <CheckboxField
              checked={
                selectedRequestingCustomers.size === selectableCount &&
                selectableCount > 0
              }
              setState={handleSelectAllRequesting}
            />
            <button
              style={{ fontSize: "12px", fontWeight: "bold" }}
              onClick={cancelRequests}
              disabled={selectedRequestingCustomers.size === 0}
            >
              送迎リクエストを取消し
            </button>
          </div>
        ) : null;
      },
      render: (value: any, row: RequestedCustomer, index: number) => {
        if (row.allowing_office_id) {
          const handleCancelClick = () => {
            if (
              confirm(`${row.name}様の送迎キャンセルリクエストを送信しますか？`)
            ) {
              postRequestCancellation(row.id, onCancellationSuccess);
            }
          };

          return (
            <div onClick={(e) => e.stopPropagation()}>
              <span>承認済み</span>
              <button
                style={{
                  backgroundColor: row.is_cancellation_requested
                    ? "#ccc"
                    : "#dc3545",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  marginLeft: "8px",
                  padding: "4px 12px",
                  fontSize: "12px",
                  cursor: row.is_cancellation_requested
                    ? "not-allowed"
                    : "pointer",
                  transition: "background 0.2s ease",
                }}
                onClick={handleCancelClick}
                disabled={row.is_cancellation_requested}
                onMouseEnter={(e) => {
                  if (!row.is_cancellation_requested) {
                    e.currentTarget.style.backgroundColor = "#c82333";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!row.is_cancellation_requested) {
                    e.currentTarget.style.backgroundColor = "#dc3545";
                  }
                }}
              >
                {row.is_cancellation_requested
                  ? "キャンセルリクエスト中"
                  : "キャンセルリクエスト"}
              </button>
            </div>
          );
        }
        return (
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ display: "flex", alignItems: "center" }}
          >
            <CheckboxField
              checked={selectedRequestingCustomers.has(index)}
              setState={(checked: boolean) =>
                handleIndividualRequestingCheckbox(index, checked)
              }
            />
            <span style={{ color: "red", fontWeight: "bold" }}>承認待ち</span>
          </div>
        );
      },
    });
  }

  return baseColumns;
};
