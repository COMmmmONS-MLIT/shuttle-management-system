// types
import { RoutePoint } from "@/types/soge";

// fontawesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWheelchair, faFlag } from "@fortawesome/free-solid-svg-icons";

type Props = {
  routePoint: RoutePoint;
  orderNumber?: number;
  isLast?: boolean;
};

const RequestedLine = ({ routePoint, orderNumber, isLast }: Props) => {
  const color_class = () => {
    if (routePoint.soge_type === "pick_up") {
      return "greet";
    } else {
      return "send";
    }
  };

  const basePointColor = () => {
    if (routePoint.point_type === "VisitingsPoint") {
      return { borderColor: "#ccc" };
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <span style={{ fontWeight: "bold", marginRight: "2px" }}>
        {isLast ? (
          <FontAwesomeIcon
            icon={faFlag}
            style={{ color: "#cccccc", marginLeft: "0" }}
          />
        ) : (
          orderNumber
        )}
      </span>
      <li key={routePoint.id} style={{ cursor: "default", flex: 1 }}>
        <p className={color_class()} style={{ ...basePointColor() }}>
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
            </>
          )}
          <span>{routePoint.actual_time}</span>
        </p>
      </li>
    </div>
  );
};

export default RequestedLine;
