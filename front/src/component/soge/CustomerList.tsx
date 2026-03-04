import React from "react";
import CustomerLine from "./CustomerLine";

// types
import { VisitingsCustomer } from "@/types/visitingsCustomer";
import { RoutePoint } from "@/types/soge";

// dnd-kit
import { useDroppable } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import { useUser } from "@/contexts/UserContext";

type Props = {
  routePoints: RoutePoint[];
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
            {category === "tourism" && <th>乗車人数</th>}
            {category === "welfare" && (
              <>
                <th>乗車時間</th>
                <th>待ち時間</th>
                <th>車両制限</th>
                <th>
                  歩行器
                  <br />
                  車椅子
                </th>
                <th>添乗員の有無</th>
              </>
            )}
          </tr>
        </thead>
        <SortableContext items={dndIds}>
          <tbody className="js-user">
            {routePoints.map((point, index) => (
              <CustomerLine
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
