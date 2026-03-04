import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useUser } from "@/contexts/UserContext";

// types
import { RoutePoint } from "@/types/soge";

// fontawesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faWheelchair,
  faGripVertical,
  faTrash,
  faFlag,
} from "@fortawesome/free-solid-svg-icons";

type Props = {
  routePoint: RoutePoint;
  activeId?: number | string | null;
  canSort?: boolean;
  onDelete?: (id: number) => void;
  orderNumber?: number;
  isLast?: boolean;
};

const Line = ({
  routePoint,
  activeId = null,
  canSort = false,
  onDelete,
  orderNumber,
  isLast,
}: Props) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: routePoint.dnd_id });

  // ドラッグ中の要素は無色にするため、一番下にする
  const zIndex = () => {
    if (activeId === routePoint.id) {
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

  const showDeleteButton =
    routePoint.point_type === "VisitingsCustomer" && onDelete;

  const basePointColor = () => {
    if (routePoint.point_type === "VisitingsPoint") {
      return { borderColor: "#ccc" };
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center"}}>
      <span style={{ fontWeight: "bold", marginRight: "2px", display: "inline-block", width: "10px" }}>
        {isLast ? (
          <FontAwesomeIcon icon={faFlag} style={{ color: "#cccccc", marginLeft: "0", width: "10px" }} />
        ) : (
          orderNumber
        )}
      </span>
      <li
        key={routePoint.id}
        ref={routePoint.arrival ? null : setNodeRef}
        style={{ ...(canSort ? style : {}), cursor: "default", flex: 1 }}
      >
        {activeId === routePoint.dnd_id ? (
          <p></p>
        ) : (
          <p className={color_class()} style={{...basePointColor()}}>
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
            {routePoint.point_type === "VisitingsCustomer" && (
              <>
                <span>
                  {routePoint.wc && <FontAwesomeIcon icon={faWheelchair} />}
                </span>
                {category === "tourism" && (
                  <span>{routePoint.passenger_count}人</span>
                )}
              </>
            )}
            <span>{routePoint.actual_time}</span>
            {showDeleteButton && (
              <span>
                <FontAwesomeIcon
                  icon={faTrash}
                  style={{ cursor: "pointer", color: "red" }}
                  onClick={() => {
                    if (confirm("この利用者を便から削除しますか？")) {
                      onDelete(routePoint.id);
                    }
                  }}
                />
              </span>
            )}
          </p>
        )}
      </li>
    </div>
  );
};

export default Line;
