import React from "react";
import SogeType from "@/component/Widgets/SogeType";
import Wheelchair from "@/component/Widgets/Wheelchair";

// types
import { RoutePoint } from "@/types/soge";

// dnd-kit
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useUser } from "@/contexts/UserContext";

// font awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFlag} from "@fortawesome/free-solid-svg-icons";

type Props = {
  routePoint: RoutePoint;
  activeId: string | number | null;
};
const CustomerLine = ({ routePoint, activeId }: Props) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: routePoint.dnd_id });

  const zIndex = () => {
    if (isDragging) {
      return 99;
    } else {
      return 0;
    }
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: zIndex(),
    position: "relative" as const,
    opacity: isDragging ? 0.5 : 1,
  };

  const { category } = useUser();
  return (
    <tr
      ref={routePoint.arrival ? null : setNodeRef}
      style={{
        ...(routePoint.arrival ? {} : { ...style, cursor: "grab" }),
      }}
      {...(routePoint.arrival ? {} : { ...attributes })}
      {...(routePoint.arrival ? {} : { ...listeners })}
    >
      <td>{routePoint.arrival ? <><FontAwesomeIcon icon={faFlag} style={{ color: "#cccccc", fontSize: "1.3rem" }} /></> : SogeType(routePoint.soge_type)}</td>
      <td>
        <strong>{routePoint.actual_time}</strong>
        <br />
        {routePoint.schedule_time}
      </td>
      <td>
        <span className="name">{routePoint.display_name}</span>
        <br />
        {routePoint.address}
        <i className="fas fa-map-marker"></i>
        <p className="remarks">
          <span data-text={routePoint.note}>
            {routePoint.note?.substring(0, 20)}
          </span>
        </p>
      </td>
      {category === "tourism" && <td>{routePoint.passenger_count}</td>}
      {category === "welfare" && (
        <>
          <td>{routePoint.ride_time}</td>
          <td>{routePoint.wait_time}</td>
          <td>{routePoint.car_restriction}</td>
          <td>
            {routePoint.walker_size}
            <br />
            {Wheelchair(routePoint.wc || false)}
          </td>
          <td>
            {routePoint.need_helper ? "あり" : "なし"}
            <br />
          </td>
        </>
      )}
    </tr>
  );
};

export default CustomerLine;
