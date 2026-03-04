import React from "react";
import RequestedBinBlock from "@/component/soge/Index/Requested/RequestedBinBlock";

// types
import { TourismVisitingGroup, VisitingGroup } from "@/types/soge";

type Props = {
  visitingsGroups: (TourismVisitingGroup | VisitingGroup)[][];
  cars: string[];
};

const RequestedTable = ({ visitingsGroups, cars }: Props) => {
  return (
    <div className="table vertical js-scroll">
      <table>
        <thead>
          <tr>
            {cars.map((car) => (
              <th key={car}>
                {car}
                <br />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {visitingsGroups.map((bins, order_index) => (
            <tr key={order_index} style={{ cursor: "default" }}>
              {bins.map((bin, bin_index) => (
                <RequestedBinBlock
                  key={`${order_index}-${bin_index}`}
                  bin={bin}
                  order_index={order_index}
                  bin_index={bin_index}
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RequestedTable;
