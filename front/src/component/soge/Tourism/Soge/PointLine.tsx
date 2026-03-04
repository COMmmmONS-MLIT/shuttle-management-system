import React, { useState } from "react";
import SogeType from "@/component/Widgets/SogeType";
import CustomerLine from "@/component/soge/Tourism/Soge/CustomerLine";

// types
import { TourismRoutePoint } from "@/types/soge";

// dnd-kit
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useUser } from "@/contexts/UserContext";

// fontawesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretUp, faCaretDown } from "@fortawesome/free-solid-svg-icons";

type Props = {
  routePoint: TourismRoutePoint;
  activeId?: number | string | null;
};
const PointLine = ({ routePoint, activeId }: Props) => {
  const [isOpen, setIsOpen] = useState(false);

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
    <>
      <tr
        ref={routePoint.arrival ? null : setNodeRef}
        style={{
          ...(routePoint.arrival ? {} : { ...style, cursor: "grab" }),
        }}
        {...(routePoint.arrival ? {} : { ...attributes })}
        {...(routePoint.arrival ? {} : { ...listeners })}
      >
        <td>
          {!routePoint.arrival &&
            routePoint.customers &&
            routePoint.customers.length > 0 &&
            SogeType(routePoint.soge_type)}
        </td>
        <td>
          <strong>{routePoint.actual_time}</strong>
          <br />
          {routePoint.schedule_time}
        </td>
        <td>
          <span className="name">{routePoint.display_name}</span>
          <br />
          {routePoint.address}
        </td>
        <td>
          {!routePoint.arrival && (
            <span className="name">{routePoint.passenger_count}</span>
          )}
        </td>
        <td>
          {!routePoint.arrival &&
            routePoint.customers &&
            routePoint.customers.length > 0 && (
              <FontAwesomeIcon
                icon={isOpen ? faCaretUp : faCaretDown}
                style={{ cursor: "pointer" }}
                size="lg"
                onClick={() => setIsOpen(!isOpen)}
              />
            )}
        </td>
      </tr>
      {isOpen &&
        !activeId &&
        routePoint.customers &&
        routePoint.customers.map((customer) => (
          <CustomerLine key={customer.id} customer={customer} />
        ))}
    </>
  );
};

export default PointLine;
