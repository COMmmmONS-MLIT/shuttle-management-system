import React from "react";
import RequestedTable from "./RequestedTable";

// types
import { TourismVisitingGroup, VisitingGroup } from "@/types/soge";

type Props = {
  visitingsGroups: (TourismVisitingGroup | VisitingGroup)[][];
  cars: string[];
};

const RequestedCustomerTable = ({ visitingsGroups, cars }: Props) => {
  return (
    <>
      <div className="list">
        <div className="block active" id="TYPE2">
          <RequestedTable visitingsGroups={visitingsGroups} cars={cars} />
        </div>
      </div>
    </>
  );
};

export default RequestedCustomerTable;
