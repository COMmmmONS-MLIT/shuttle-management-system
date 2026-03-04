import React, { useState } from "react";

// fontawesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faWheelchair,
  faGripVertical,
} from "@fortawesome/free-solid-svg-icons";

// types
import { RoutePoint } from "@/types/soge";

// dnd-kit
import { useDndMonitor, DragOverlay } from "@dnd-kit/core";

type Props = {
  customer: RoutePoint | undefined;
  selectedIds: number[];
  activeId: string | number | null;
};

const Overlay = ({ customer, selectedIds, activeId }: Props) => {
  const [position, setPosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  useDndMonitor({
    onDragStart(event) {
      const e = event.activatorEvent as MouseEvent;
      setPosition({ x: e.clientX, y: e.clientY });
    },

    onDragEnd(event) {
      setPosition({ x: 0, y: 0 });
    },
    onDragCancel(event) {
      setPosition({ x: 0, y: 0 });
    },
  });

  const borderColor = () => {
    if (customer?.point_type === "VisitingsPoint") {
      return "#ccc";
    }

    switch (customer?.soge_type) {
      case "pick_up":
        return "#f8db82";
      case "drop_off":
        return "#C6D9D3";
      default:
        return "";
    }
  };

  const style: React.CSSProperties = {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    height: "25px",
    width: "230px",
    border: `2px solid ${borderColor()}`,
    boxSizing: "border-box",
    padding: "0px 8px",
    cursor: "grabbing",
  };

  const transform: React.CSSProperties = {
    top: position?.y - 12.5,
    left: position?.x - 15,
  };

  return (
    <DragOverlay style={transform}>
      {activeId && customer && (
        <div style={style}>
          <span>
            <FontAwesomeIcon
              icon={faGripVertical}
              style={{
                paddingRight: "5px",
                marginLeft: "3px",
              }}
            />
            {customer.display_name}
            {customer.point_type === "VisitingsCustomer" && customer.wc && (
              <FontAwesomeIcon icon={faWheelchair} />
            )}
          </span>
          <span>{customer.actual_time}</span>
        </div>
      )}
    </DragOverlay>
  );
};

export default Overlay;
