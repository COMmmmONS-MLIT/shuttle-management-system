import React from "react";
import PointLine from "./PointLine";

// types
import { TourismRoutePoint } from "@/types/soge";

// dnd-kit
import { useDroppable } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import { useUser } from "@/contexts/UserContext";

type Props = {
  routePoints: TourismRoutePoint[];
  activeId: string | number | null;
};

const CustomerList = ({ routePoints, activeId }: Props) => {
  const { category } = useUser();
  const { setNodeRef } = useDroppable({
    id: "soge",
  });

  const dndIds = routePoints.map((v) => ({
    id: v.dnd_id,
  }));
  return (
    <div className=" js-scroll">
      <table className="userTable" ref={setNodeRef}>
        <thead>
          <tr>
            <th>送迎</th>
            <th>
              実迎時刻
              <br />
              予迎時刻
            </th>
            <th>
              名前
              <br />
              住所
            </th>
            <th>乗車人数</th>
            <th>表示</th>
          </tr>
        </thead>
        <SortableContext items={dndIds}>
          <tbody className="js-user">
            {routePoints.map((point, index) => (
              <PointLine
                key={index}
                routePoint={point}
                activeId={activeId}
              />
            ))}
          </tbody>
        </SortableContext>
      </table>
    </div>
  );
};

export default CustomerList;
