import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useUser } from "@/contexts/UserContext";
import { useState } from "react";
import CustomerLine from "./CustomerLine";

// types
import { TourismRoutePoint } from "@/types/soge";

// fontawesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faWheelchair,
  faGripVertical,
  faTrash,
  faCaretUp,
  faCaretDown,
  faFlag,
} from "@fortawesome/free-solid-svg-icons";

type Props = {
  routePoint: TourismRoutePoint;
  activeId?: number | string | null;
  canSort?: boolean;
  onDelete: (id: number) => void;
  orderNumber?: number;
  isLast?: boolean;
};

const PointLine = ({
  routePoint,
  activeId = null,
  canSort = false,
  onDelete,
  orderNumber,
  isLast,
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: routePoint.dnd_id });

  // ドラッグ中の要素は無色にするため、一番下にする
  const zIndex = () => {
    if (activeId === routePoint.dnd_id) {
      return 0;
    } else {
      return 1;
    }
  };
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    position: "relative" as const,
    zIndex: zIndex(),
  };

  const color_class = () => {
    if (routePoint.soge_type === "pick_up") {
      return "greet";
    } else {
      return "send";
    }
  };

  const { category } = useUser();

  const basePointColor = () => {
    if (routePoint.point_type === "VisitingsPoint") {
      return { borderColor: "#ccc" };
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {routePoint.point_type === "VisitingsPoint" && (
        <span style={{ fontWeight: "bold", marginRight: "2px", display: "inline-block", width: "10px", alignSelf: "flex-start" }}>
          {isLast ? (
            <FontAwesomeIcon icon={faFlag} style={{ color: "#cccccc", marginLeft: "0", width: "10px" }} />
          ) : (
            orderNumber
          )}
        </span>
      )}
      <li
        key={routePoint.id}
        ref={routePoint.arrival ? null : setNodeRef}
        style={{ ...(canSort ? style : {}), cursor: "default", flex: 1 }}
      >
        {activeId === routePoint.dnd_id ? (
          <p></p>
        ) : (
          <>
            <p className={color_class()} style={basePointColor()}>
              <span>
                {!routePoint.arrival && (
                  <FontAwesomeIcon
                    icon={faGripVertical}
                    style={{
                      paddingRight: "5px",
                      cursor: "grab",
                    }}
                    {...attributes}
                    {...listeners}
                  />
                )}
              </span>
            <span
              style={{
                maxWidth: "100px",
                overflow: "hidden",
                overflowX: "auto",
                whiteSpace: "nowrap",
                display: "inline-block",
                msOverflowStyle: "none",
                scrollbarWidth: "none",
              }}
            >
              {routePoint.display_name}
            </span>
            <span>{routePoint.actual_time}</span>
            <span>
              {!routePoint.arrival &&
                routePoint.customers &&
                routePoint.customers.length > 0 && (
                  <FontAwesomeIcon
                    icon={isOpen ? faCaretUp : faCaretDown}
                    style={{ cursor: "pointer" }}
                    onClick={() => setIsOpen(!isOpen)}
                  />
                )}
            </span>
          </p>
          {isOpen &&
            !activeId &&
            routePoint.customers &&
            routePoint.customers.map((customer) => (
              <CustomerLine
                key={customer.id}
                customer={customer}
                activeId={activeId}
                canSort={canSort}
                onDelete={onDelete}
              />
            ))}
          </>
        )}
      </li>
    </div>
  );
};

export default PointLine;
