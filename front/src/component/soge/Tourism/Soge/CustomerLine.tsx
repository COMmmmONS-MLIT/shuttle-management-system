import React, { useState } from "react";
import SogeType from "@/component/Widgets/SogeType";

// types
import { TourismCustomerLine } from "@/types/soge";

// dnd-kit
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useUser } from "@/contexts/UserContext";

type Props = {
  customer: TourismCustomerLine;
  activeId?: number | string | null;
};
const CustomerLine = ({ customer }: Props) => {
  return (
    <tr className="wait">
      <td></td>
      <td>
        <strong>{customer.actual_time}</strong>
        <br />
        {customer.schedule_time}
      </td>
      <td>
        <span className="name">
          {customer.display_name}({customer.phone_number})
        </span>
        <br />
        {customer.address}
        <p className="remarks">
          <span data-text={customer.note}>
            {customer.note?.substring(0, 20)}
          </span>
        </p>
      </td>
      <td>{customer.passenger_count}</td>
      <td></td>
    </tr>
  );
};

export default CustomerLine;
