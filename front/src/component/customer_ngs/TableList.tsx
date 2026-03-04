import moment from "moment";
import Image from "next/image";
import { CustomerNg } from "@/types/customerNg";
import Base64Support from "@/component/Widgets/Base64Support";

// font awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faAngleDoubleRight,
} from "@fortawesome/free-solid-svg-icons";

type Props = {
  customerNgs: CustomerNg[];
  onEdit: (data: CustomerNg) => void;
};

const CustomerNgTableList = ({ customerNgs, onEdit }: Props) => {

  const renderPersonInfo = (person: CustomerNg["customer_a"] | CustomerNg["customer_b"]) => (
    <dl>
      <dt>
        <a href={person.image ? Base64Support(person.image) : "/img/no_image.png"} target="_blank">
          <Image
            width={50}
            height={50}
            src={person.image ? Base64Support(person.image) : "/img/no_image.png"}
            alt={person.name}
          />
        </a>
      </dt>
      <dd>{person.name}</dd>
    </dl>
  );

  return (
    <>

      <fieldset className="carpool">
        <div className="viewport js-scroll">
          <table className="carpoolTable">
            <thead>
              <tr>
                <th className="targetA">対象者A</th>
                <th></th>
                <th className="targetB">対象者B</th>
                <th>登録日</th>
                <th>NG理由</th>
              </tr>
            </thead>
            <tbody>
              {customerNgs.map((customerNg) => (
                <tr key={customerNg.id} onClick={() => onEdit(customerNg)} style={{ cursor: 'pointer' }}>
                  <td>{renderPersonInfo(customerNg.customer_a)}</td>
                  <td className="icon">
                    <FontAwesomeIcon icon={faAngleDoubleRight} />
                  </td>
                  <td>{renderPersonInfo(customerNg.customer_b)}</td>
                  <td>{moment(customerNg.created_at).format("YYYY/MM/DD")}</td>
                  <td className="text js-reason">{customerNg.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </fieldset>
    </>
  );
};

export default CustomerNgTableList;
