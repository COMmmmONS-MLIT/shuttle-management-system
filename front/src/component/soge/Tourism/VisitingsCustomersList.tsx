import React, { useState, useEffect } from "react";
import HttpClient from "@/adapter/HttpClient";
import TourismVisitingsCustomerLine from "./VisitingsCustomerLine";
import { useMemo } from "react";
import Sortable from "@/component/Widgets/Sortable";

// font awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faWheelchair,
  faUser,
  faCompress,
  faMap,
  faHotel,
} from "@fortawesome/free-solid-svg-icons";

// types
import { VisitingsCustomer } from "@/types/visitingsCustomer";
import { ResponseVisitingsCustomerIndex } from "@/types/ApiResponse/soge";

// dnd-kit
import { SortableContext } from "@dnd-kit/sortable";

type Props = {
  visitingsCustomers: VisitingsCustomer[];
  officeName: string;
};

const TourismVisitingsCustomersList = ({
  visitingsCustomers,
  officeName,
}: Props) => {
  const [sortKey, setSortKey] = useState<string>("schedule_time");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const handleSort = (newOrder: string) => {
    const lastUnderscoreIndex = newOrder.lastIndexOf("_");
    const key = newOrder.substring(0, lastUnderscoreIndex);
    const order = newOrder.substring(lastUnderscoreIndex + 1) as "asc" | "desc";
    setSortKey(key);
    setSortOrder(order);
  };

  const sortedCustomers = useMemo(() => {
    if (!sortKey) {
      return visitingsCustomers;
    }

    return [...visitingsCustomers].sort((a, b) => {
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
  }, [visitingsCustomers, sortKey, sortOrder]);

  const dndIds = visitingsCustomers.map((v) => ({
    id: "vc-" + v.id,
  }));

  const currentOrder = sortKey ? `${sortKey}_${sortOrder}` : "";

  return (
    <div className="user">
      <div className="head">
        <h2>
          <FontAwesomeIcon icon={faHotel} />
          {officeName}
        </h2>
        <div className="selectbox">
          <div className="sortBody js-accordion-cont">
            <div className="sortView">
              <div className="searchbox"></div>
            </div>
          </div>
        </div>
      </div>
      <p className="hed">予約</p>
      <div className="stickyWrap">
        <table className="userTable">
          <thead style={{ zIndex: 1 }}>
            <tr>
              <th></th>
              <th>送迎</th>
              <th>乗車場所</th>
              <th>降車場所</th>
              <th>名前</th>
              <th>乗車人数</th>
              <Sortable
                label="予迎時刻"
                sortKey="schedule_time"
                currentOrder={currentOrder}
                onChange={handleSort}
              />
            </tr>
          </thead>
          <tbody className="js-user">
            <SortableContext items={dndIds}>
              {sortedCustomers.map((vc, index) => (
                <TourismVisitingsCustomerLine
                  key={index}
                  visitingsCustomer={vc}
                />
              ))}
            </SortableContext>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TourismVisitingsCustomersList;
