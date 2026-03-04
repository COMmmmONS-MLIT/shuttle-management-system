import React from "react";
import Table from "./Table";

// types
import { VisitingGroup, RoutePoint } from "@/types/soge";
import { Car } from "@/types/car";

type Props = {
  visitingsGroups: VisitingGroup[][];
  setVisitingsGroups: React.Dispatch<React.SetStateAction<VisitingGroup[][]>>;
  cars: Car[];
  activeId: number | string | null;
  canSort: boolean;
  overBinId: number | string | null;
  customersList: RoutePoint[];
  date: string;
  openDriverModal: (visitingId: number) => void;
  onClickMap: (visitingId: number) => void;
  setMapVersion: React.Dispatch<React.SetStateAction<number>>;
  fetchVisitingsCustomers: (d?: string) => void;
  fetchVisitings: (d?: string) => void;
};

const CustomerTable = ({
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
  return (
    <>
      <div className="list">
        <div className="block active" id="TYPE2">
          <Table
            visitingsGroups={visitingsGroups}
            setVisitingsGroups={setVisitingsGroups}
            cars={cars}
            activeId={activeId}
            canSort={canSort}
            overBinId={overBinId}
            customersList={customersList}
            date={date}
            openDriverModal={openDriverModal}
            onClickMap={onClickMap}
            setMapVersion={setMapVersion}
            fetchVisitingsCustomers={fetchVisitingsCustomers}
            fetchVisitings={fetchVisitings}
          />
        </div>
      </div>
    </>
  );
};

export default CustomerTable;
