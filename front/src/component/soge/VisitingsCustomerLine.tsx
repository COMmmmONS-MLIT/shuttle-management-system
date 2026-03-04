import React, { useContext } from "react";
import HttpClient from "@/adapter/HttpClient";
import { useSortable } from "@dnd-kit/sortable";
import SogeType from "@/component/Widgets/SogeType";
import Wheelchair from "@/component/Widgets/Wheelchair";
import { SuccessToast } from "../ReactHotToast/ToastMessage";
import { SuggestedVisitingsCustomersContext } from "@/contexts/SuggestedVisitingsCustomersContext";

// types
import { VisitingsCustomer } from "@/types/visitingsCustomer";
import { ResponseCustomers } from "@/types/ApiResponse/customer";

// fontawesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGripVertical } from "@fortawesome/free-solid-svg-icons";

type Props = {
  visitingsCustomer: VisitingsCustomer;
  isSuggested?: boolean;
};

const VisitingsCustomerLine = ({
  visitingsCustomer,
  isSuggested = false,
}: Props) => {
  const { attributes, listeners, setNodeRef } = useSortable({
    id: visitingsCustomer.selected
      ? 0
      : isSuggested
        ? "suggested-vc-" + visitingsCustomer.id
        : "vc-" + visitingsCustomer.id,
  });

  const { setSuggestedCustomers, setSelectedCustomer } = useContext(
    SuggestedVisitingsCustomersContext,
  );

  const httpClient = new HttpClient();
  const fetchSuggestedCustomers = async () => {
    const url = `/visitings_customers/${visitingsCustomer.id}/suggested_visiting_customers`;
    const response = await httpClient.get<ResponseCustomers>(url);

    const resData = response.data.customers;

    if (resData.length === 0) {
      SuccessToast("候補者が見つかりません");
      setSuggestedCustomers([]);
      setSelectedCustomer(null);
    } else {
      setSuggestedCustomers(resData);
      setSelectedCustomer(visitingsCustomer);
    }
  };

  if (visitingsCustomer.selected) {
    return (
      <tr
        className="grayed-out-row"
        style={{ cursor: "pointer" }}
        onClick={() => {
          fetchSuggestedCustomers();
        }}
      >
        <td></td>
        <td>{SogeType(visitingsCustomer.soge_type)}</td>
        <td>{visitingsCustomer.cd}</td>
        <td>{visitingsCustomer.name}</td>
        <td>{visitingsCustomer.pick_up_point_name}</td>
        <td>{visitingsCustomer.drop_off_point_name}</td>
        <td>{visitingsCustomer.schedule_time}</td>
        <td>{visitingsCustomer.start_time}</td>
        <td>{visitingsCustomer.car_restriction}</td>
        <td>{Wheelchair(visitingsCustomer.wc)}</td>
      </tr>
    );
  } else {
    return (
      <tr
        key={visitingsCustomer.id}
        ref={setNodeRef}
        style={{ cursor: "pointer" }}
        onClick={() => {
          fetchSuggestedCustomers();
        }}
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
        <td>{visitingsCustomer.cd}</td>
        <td>{visitingsCustomer.name}</td>
        <td>{visitingsCustomer.pick_up_point_name}</td>
        <td>{visitingsCustomer.drop_off_point_name}</td>
        <td>{visitingsCustomer.schedule_time}</td>
        <td>{visitingsCustomer.start_time}</td>
        <td>{visitingsCustomer.car_restriction}</td>
        <td>{Wheelchair(visitingsCustomer.wc)}</td>
      </tr>
    );
  }
};

export default VisitingsCustomerLine;
