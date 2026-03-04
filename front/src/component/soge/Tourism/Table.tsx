import React from "react";
import TourismBinBlock from "./BinBlock";

// font awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faWheelchair,
  faBoxes,
} from "@fortawesome/free-solid-svg-icons";

// types
import { TourismVisitingGroup, TourismRoutePoint } from "@/types/soge";
import { Car } from "@/types/car";

// dnd-kit
import { SortableContext } from "@dnd-kit/sortable";
import { visitNode } from "typescript";

type Props = {
  visitingsGroups: TourismVisitingGroup[][];
  setVisitingsGroups: React.Dispatch<
    React.SetStateAction<TourismVisitingGroup[][]>
  >;
  cars: Car[];
  activeId: number | string | null;
  canSort: boolean;
  overBinId: number | string | null;
  customersList: TourismRoutePoint[];
  date: string;
  openDriverModal: (visitingId: number) => void;
  onClickMap: (visitingId: number) => void;
  setMapVersion: React.Dispatch<React.SetStateAction<number>>;
  fetchVisitingsCustomers: (d?: string) => void;
  fetchVisitings: (d?: string) => void;
};

const TourismTable = ({
  visitingsGroups,
  setVisitingsGroups,
  cars,
  activeId,
  canSort,
  overBinId,
  customersList,
  date,
  openDriverModal,
  onClickMap,
  setMapVersion,
  fetchVisitingsCustomers,
  fetchVisitings,
}: Props) => {
  const dndIds = visitingsGroups
    .flatMap((bins) => bins.flatMap((bin) => bin?.route_points || []))
    .map((v) => ({
      id: v.dnd_id,
    }));

  return (
    <div
      className="table vertical js-scroll"
      style={{
        overflowY: "auto",
        maxHeight: "calc(100vh - 130px)",
        borderTop: "solid 1px var(--color-set1)",
        borderLeft: "solid 1px var(--color-set1)",
      }}
    >
      <table style={{ borderCollapse: "separate", borderSpacing: 0 }}>
        <thead>
          <tr>
            {cars.map((car) => (
              <th
                key={car.number}
                data-number={car.number}
                style={{
                  position: "sticky",
                  top: 0,
                  zIndex: 10,
                  backgroundColor: "var(--color-set1-weak)",
                  border: "none",
                  borderRight: "solid 1px var(--color-set1)",
                  borderBottom: "solid 1px var(--color-set1)",
                }}
              >
                {car.name} {car.id + "号車"}
                <br />
                （{car.number}）
                <br />
                <FontAwesomeIcon icon={faUsers} />
                <span className="js-total-user">{car.max_seat}</span>
                <FontAwesomeIcon icon={faWheelchair} />
                <span className="js-total-wheelchair">{car.max_wc_seat}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <SortableContext items={dndIds}>
            {visitingsGroups.map((bins, order_index) => (
              <tr key={order_index} style={{ cursor: "default" }}>
                {bins.map((bin, bin_index) => (
                  <TourismBinBlock
                    key={`${order_index}-${bin_index}`}
                    bin={bin}
                    order_index={order_index}
                    bin_index={bin_index}
                    activeId={activeId}
                    canSort={canSort}
                    overBinId={overBinId}
                    date={date}
                    setVisitingsGroups={setVisitingsGroups}
                    openDriverModal={openDriverModal}
                    onClickMap={onClickMap}
                    setMapVersion={setMapVersion}
                    fetchVisitingsCustomers={fetchVisitingsCustomers}
                    fetchVisitings={fetchVisitings}
                  />
                ))}
              </tr>
            ))}
          </SortableContext>
        </tbody>
      </table>
    </div>
  );
};

export default TourismTable;
