import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCar } from "@fortawesome/free-solid-svg-icons";
import { SelfVisitingsCustomer } from "@/types/visitingsCustomer";

type Props = {
  selfVisitingsCustomers: SelfVisitingsCustomer[];
};

const SelfVisitsList = ({ selfVisitingsCustomers }: Props) => {
  return (
    <div className="self-visits-container">
      <div className="head">
        <h2>
          <FontAwesomeIcon icon={faCar} />
          自来・自退者
        </h2>
      </div>
      <div className="self-visit-list">
        {selfVisitingsCustomers.length === 0 ? (
          <p className="self-visits-empty">自来・自退者はいません</p>
        ) : (
          selfVisitingsCustomers.map((item, index) => (
            <div key={index} className="self-visit-item">
              <div className="self-visit-item__name">{item.customer_name}</div>
              {item.self_pick_up && (
                <span className="self-visit-item__badge self-visit-item__badge--pickup">
                  自来
                </span>
              )}
              {item.self_drop_off && (
                <span className="self-visit-item__badge self-visit-item__badge--dropoff">
                  自退
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SelfVisitsList;
