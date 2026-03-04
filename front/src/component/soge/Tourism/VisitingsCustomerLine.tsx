import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import SogeType from "@/component/Widgets/SogeType";
import Wheelchair from "@/component/Widgets/Wheelchair";

// types
import { VisitingsCustomer } from "@/types/visitingsCustomer";

// fontawesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGripVertical } from "@fortawesome/free-solid-svg-icons";

type Props = {
  visitingsCustomer: VisitingsCustomer;
};

const TourismVisitingsCustomerLine = ({ visitingsCustomer }: Props) => {
  const { attributes, listeners, setNodeRef } = useSortable({
    id: visitingsCustomer.selected ? 0 : "vc-" + visitingsCustomer.id,
  });
  if (visitingsCustomer.selected) {
    return (
      <tr className="grayed-out-row" style={{ cursor: "default" }}>
        <td></td>
        <td>{SogeType(visitingsCustomer.soge_type)}</td>
        <td>{visitingsCustomer.pick_up_point_name}</td>
        <td>{visitingsCustomer.drop_off_point_name}</td>
        <td>{visitingsCustomer.name}</td>
        <td>{visitingsCustomer.passenger_count}人</td>
        <td>{visitingsCustomer.schedule_time}</td>
      </tr>
    );
  } else {
    return (
      <tr
        key={visitingsCustomer.id}
        ref={setNodeRef}
        style={{ cursor: "default" }}
      >
        <td>
          <FontAwesomeIcon
            icon={faGripVertical}
            {...attributes}
            {...listeners}
            style={{ cursor: "grab" }}
          />
        </td>
        <td>{SogeType(visitingsCustomer.soge_type)}</td>
        <td>{visitingsCustomer.pick_up_point_name}</td>
        <td>{visitingsCustomer.drop_off_point_name}</td>
        <td>{visitingsCustomer.name}</td>
        <td>{visitingsCustomer.passenger_count}人</td>
        <td>{visitingsCustomer.schedule_time}</td>
      </tr>
    );
  }
};

export default TourismVisitingsCustomerLine;
