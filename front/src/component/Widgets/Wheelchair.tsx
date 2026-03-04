import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWheelchair } from "@fortawesome/free-solid-svg-icons";

const Wheelchair = (gate: boolean) => {
  if (gate) {
    return <FontAwesomeIcon icon={faWheelchair} />;
  } else {
    return <>-</>;
  }
};

export default Wheelchair;
