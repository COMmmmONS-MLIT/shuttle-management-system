import React, { useContext } from "react";
import VisitingsCustomerLine from "./VisitingsCustomerLine";

// font awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWheelchair, faUser } from "@fortawesome/free-solid-svg-icons";

// dnd-kit
import { SortableContext } from "@dnd-kit/sortable";
import { SuggestedVisitingsCustomersContext } from "@/contexts/SuggestedVisitingsCustomersContext";

const SuggestedVisitingsCustomersList = () => {
  const { suggestedCustomers, selectedCustomer } = useContext(SuggestedVisitingsCustomersContext);

  const dndIds = suggestedCustomers.map((v) => ({
    id: "suggested-vc-" + v.id,
  }));

  return (
    <div className="user suggested" style={{ width: "100%", boxSizing: "border-box", margin: 0 }}>
      <div className="head">
        <h2>
          <FontAwesomeIcon icon={faUser} />
          候補者
        </h2>
      </div>
      <p className="hed">{selectedCustomer?.name ?? "候補者"}</p>
      <div className="stickyWrap">
        <table className="userTable">
          <thead style={{ zIndex: 1 }}>
            <tr>
              <th></th>
              <th>送迎</th>
              <th>利用者番号</th>
              <th>名前</th>
              <th>乗車地点</th>
              <th>降車地点</th>
              <th>予定時間</th>
              <th>開始時間</th>
              <th>距離</th>
              <th>車両制限</th>
              <th>
                <FontAwesomeIcon icon={faWheelchair} />
              </th>
            </tr>
          </thead>
          <tbody className="js-user">
            <SortableContext items={dndIds}>
              {suggestedCustomers.map((vc, index) => (
                <VisitingsCustomerLine
                  key={index}
                  visitingsCustomer={vc}
                  isSuggested={true}
                />
              ))}
            </SortableContext>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SuggestedVisitingsCustomersList;
