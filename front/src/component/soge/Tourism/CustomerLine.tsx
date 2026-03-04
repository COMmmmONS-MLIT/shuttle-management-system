import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useUser } from "@/contexts/UserContext";
import { useState } from "react";

// types
import { RoutePoint } from "@/types/soge";

// fontawesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faWheelchair,
  faGripVertical,
  faTrash,
  faCaretUp,
  faCaretDown,
} from "@fortawesome/free-solid-svg-icons";

type Props = {
  customer: any;
  activeId?: number | string | null;
  canSort?: boolean;
  onDelete: (id: number) => void;
};

const CustomerLine = ({
  customer,
  activeId = null,
  canSort = false,
  onDelete,
}: Props) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: customer.dnd_id });

  // ドラッグ中の要素は無色にするため、一番下にする
  const zIndex = () => {
    if (activeId === customer.id) {
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
    if (customer.soge_type === "pick_up") {
      return "greet";
    } else {
      return "send";
    }
  };

  const { category } = useUser();

  return (
    <li
      key={customer.id}
      ref={setNodeRef}
      style={{ ...(canSort ? style : {}), cursor: "default" }}
    >
      {activeId === customer.dnd_id ? (
        <p></p>
      ) : (
        <p className={color_class()}>
          <span>
            {!customer.arrival && (
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
            {customer.display_name}
          </span>
          <span>{customer.wc && <FontAwesomeIcon icon={faWheelchair} />}</span>
          <span>{customer.passenger_count}人</span>
          <span>{customer.actual_time}</span>
          {  (
            <span>
              <FontAwesomeIcon
                icon={faTrash}
                style={{ cursor: "pointer", color: "red" }}
                onClick={() => {
                  if (confirm("この利用者を便から削除しますか？")) {
                    onDelete(customer.id);
                  }
                }}
              />
            </span>
          )}
        </p>
      )}
    </li>
  );
};

export default CustomerLine;
