import React, { useState } from "react";
import { useDndMonitor, DragOverlay } from "@dnd-kit/core";
import Image from "next/image";
import Base64Support from "@/component/Widgets/Base64Support";

// types
import { RoutePoint } from "@/types/soge";

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

  const transform: React.CSSProperties = {
    top: position?.y - 12.5,
    left: position?.x - 15,
  };

  const borderColor = () => {
    switch (customer?.soge_type) {
      case "pick_up":
        return "#f8db82";
      case "drop_off":
        return "#c6d9d3";
      case "point":
        return "#ccc";
      default:
        return "";
    }
  };

  const style: React.CSSProperties = {
    display: "inline-block",
    backgroundColor: "white",
    minWidth: "60px",
    minHeight: "60px",
    padding: "5px",
    border: `2px solid ${borderColor()}`,
    boxSizing: "border-box",
    textAlign: "center",
    cursor: "grabbing",
  };

  return (
    <table>
      <DragOverlay style={transform}>
        {activeId && customer && (
          <>
            <div style={style}>
              {customer.image ? (
                <Image
                  width={50}
                  height={50}
                  src={Base64Support(customer.image)}
                  alt={customer.display_name}
                />
              ) : (
                <Image
                  width={50}
                  height={50}
                  src="/img/no_image.png"
                  alt="No Image"
                />
              )}
              <p>{customer.display_name}</p>
            </div>
          </>
        )}
      </DragOverlay>
    </table>
  );
};

export default Overlay;
