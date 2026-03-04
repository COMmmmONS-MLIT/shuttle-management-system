// types
import { RoutePoint } from "@/types/soge";

// fontawesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWheelchair } from "@fortawesome/free-solid-svg-icons";

type Props = {
  customer: any;
};

const RequestedCustomerLine = ({ customer }: Props) => {
  const color_class = () => {
    if (customer.soge_type === "pick_up") {
      return "greet";
    } else {
      return "send";
    }
  };

  return (
    <li key={customer.id}>
      <p className={color_class()}>
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
      </p>
    </li>
  );
};

export default RequestedCustomerLine;

