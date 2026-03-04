import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserSlash } from "@fortawesome/free-solid-svg-icons";
import { AbsentCustomer } from "@/types/visitingsCustomer";

type Props = {
  absentCustomers: AbsentCustomer[];
};

const AbsentCustomersList = ({ absentCustomers }: Props) => {
  return (
    <div className="self-visits-container">
      <div className="head">
        <h2>
          <FontAwesomeIcon icon={faUserSlash} />
          本日のお休み
        </h2>
      </div>
      <div className="self-visit-list">
        {absentCustomers.length === 0 ? (
          <p className="self-visits-empty">本日のお休みはいません</p>
        ) : (
          absentCustomers.map((item, index) => (
            <div key={index} className="self-visit-item">
              <div className="self-visit-item__name">{item.customer_name}</div>
              {item.absence_reason && (
                <span>
                  {item.absence_reason}
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AbsentCustomersList;
