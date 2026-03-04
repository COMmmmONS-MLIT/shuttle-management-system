import React, { useState, useMemo } from "react";
import VisitingsCustomerLine from "./VisitingsCustomerLine";
import Sortable from "@/component/Widgets/Sortable";
import CheckboxField from "@/component/FormControls/CheckboxField";

// font awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWheelchair, faUser } from "@fortawesome/free-solid-svg-icons";

// types
import { VisitingsCustomer } from "@/types/visitingsCustomer";

// dnd-kit
import { SortableContext } from "@dnd-kit/sortable";

type Props = {
  visitingsCustomers: VisitingsCustomer[];
  officeName: string;
};

const VisitingsCustomersList = ({ visitingsCustomers, officeName }: Props) => {
  const [sortKey, setSortKey] = useState<string>("name_kana");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [unassigned, setUnassigned] = useState<boolean>(false);

  const handleSort = (newOrder: string) => {
    const lastUnderscoreIndex = newOrder.lastIndexOf("_");
    const key = newOrder.substring(0, lastUnderscoreIndex);
    const order = newOrder.substring(lastUnderscoreIndex + 1) as "asc" | "desc";
    setSortKey(key);
    setSortOrder(order);
  };

  const filteredCustomers = useMemo(() => {
    if (!unassigned) {
      return visitingsCustomers;
    }
    return visitingsCustomers.filter((vc) => !vc.selected);
  }, [visitingsCustomers, unassigned]);

  const sortedCustomers = useMemo(() => {
    if (!sortKey) {
      return filteredCustomers;
    }

    return [...filteredCustomers].sort((a, b) => {
      if (sortKey === "name_kana") {
        const sogeTypeOrder = { pick_up: 0, drop_off: 1 };
        const aSogeTypeOrder =
          sogeTypeOrder[a.soge_type as keyof typeof sogeTypeOrder] ?? 2;
        const bSogeTypeOrder =
          sogeTypeOrder[b.soge_type as keyof typeof sogeTypeOrder] ?? 2;

        if (aSogeTypeOrder !== bSogeTypeOrder) {
          return sortOrder === "asc"
            ? aSogeTypeOrder - bSogeTypeOrder
            : bSogeTypeOrder - aSogeTypeOrder;
        }
      }

      const aValue = a[sortKey as keyof VisitingsCustomer];
      const bValue = b[sortKey as keyof VisitingsCustomer];

      if (sortKey !== "name_kana") {
        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return sortOrder === "asc" ? 1 : -1;
        if (bValue == null) return sortOrder === "asc" ? -1 : 1;
      }

      const result = String(aValue).localeCompare(String(bValue), "ja");
      return sortOrder === "desc" ? -result : result;
    });
  }, [filteredCustomers, sortKey, sortOrder]);

  const dndIds = sortedCustomers.map((v) => ({
    id: "vc-" + v.id,
  }));

  const currentOrder = sortKey ? `${sortKey}_${sortOrder}` : "";

  return (
    <div
      className="user"
      style={{ width: "100%", boxSizing: "border-box", margin: "0 0 20px 0" }}
    >
      <div className="head">
        <h2>
          <FontAwesomeIcon icon={faUser} />
          {officeName}
        </h2>
      </div>
      <div
        className="hed"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <p className="hed">利用者</p>
        <p>
          <CheckboxField
            label="便に紐づいていない利用者のみ表示"
            checked={unassigned}
            setState={setUnassigned}
          />
        </p>
      </div>

      <div className="stickyWrap">
        <table className="userTable">
          <thead style={{ zIndex: 1 }}>
            <tr>
              <th></th>
              <th>送迎</th>
              <th>利用者番号</th>
              <Sortable
                label="名前"
                sortKey="name_kana"
                currentOrder={currentOrder}
                onChange={handleSort}
              />
              <th>乗車場所</th>
              <th>降車場所</th>
              <Sortable
                label="予迎時刻"
                sortKey="schedule_time"
                currentOrder={currentOrder}
                onChange={handleSort}
              />
              <Sortable
                label="開始時間"
                sortKey="start_time"
                currentOrder={currentOrder}
                onChange={handleSort}
              />
              <th>車両制限</th>
              <th>
                <FontAwesomeIcon icon={faWheelchair} />
              </th>
            </tr>
          </thead>
          <tbody className="js-user">
            <SortableContext items={dndIds}>
              {sortedCustomers.map((vc, index) => (
                <VisitingsCustomerLine key={index} visitingsCustomer={vc} />
              ))}
            </SortableContext>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VisitingsCustomersList;
