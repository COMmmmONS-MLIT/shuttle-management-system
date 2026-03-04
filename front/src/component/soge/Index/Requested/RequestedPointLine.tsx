import { useUser } from "@/contexts/UserContext";
import { useState } from "react";
import RequestedCustomerLine from "./RequestedCustomerLine";

// types
import { TourismRoutePoint } from "@/types/soge";

// fontawesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretUp, faCaretDown } from "@fortawesome/free-solid-svg-icons";

type Props = {
  routePoint: TourismRoutePoint;
};

const RequestedPointLine = ({ routePoint }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const { category } = useUser();

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
    <li key={routePoint.id}>
      <>
        <p className={color_class()} style={basePointColor()}>
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
          routePoint.customers &&
          routePoint.customers.map((customer) => (
            <RequestedCustomerLine key={customer.id} customer={customer} />
          ))}
      </>
    </li>
  );
};

export default RequestedPointLine;
