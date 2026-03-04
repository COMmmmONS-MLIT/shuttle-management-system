// types
import RequestedCustomer from "@/types/requestedCustomer";
import HttpClient from "@/adapter/HttpClient";
import {
  SuccessToast,
  ErrorToast,
} from "@/component/ReactHotToast/ToastMessage";

// contect
import { useUser } from "@/contexts/UserContext";
import { postUpdateAllowed } from "./postUpdateAllowed";
// fontawesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faSave, faTrash } from "@fortawesome/free-solid-svg-icons";

type Props = {
  requestedCustomer: RequestedCustomer;
  setRequestedCustomer: React.Dispatch<
    React.SetStateAction<RequestedCustomer | null>
  >;
  onUpdate: () => void;
};

const RequestedCustomerModal = ({
  requestedCustomer,
  setRequestedCustomer,
  onUpdate,
}: Props) => {
  const { category } = useUser();

  const approveRequest = () => {
    postUpdateAllowed([requestedCustomer.id], () => {
      setRequestedCustomer(null);
      onUpdate();
    });
  };

  const rejectRequest = () => {
    if (!confirm("本当に却下しますか？")) {
      return;
    }

    const httpClient = new HttpClient();
    const url = "/requested_customers/reject_approve";
    const params = {
      requested_customer_id: requestedCustomer.id,
    };

    httpClient
      .post<{ message: string }>(url, params)
      .then((response) => {
        SuccessToast(response.data.message);
        setRequestedCustomer(null);
        onUpdate();
      })
      .catch((error) => {
        const errorData = error.response?.data;
        if (errorData?.full_messages) {
          errorData.full_messages.forEach((message: string) => {
            ErrorToast(message);
          });
        }
      });
  };

  return (
    <section>
      <div className="modalSCT active">
        <div className="mask" onClick={() => setRequestedCustomer(null)}></div>
        <div className="cont">
          <div
            className="close"
            onClick={() => setRequestedCustomer(null)}
          ></div>
          <div className="inner wide USER">
            <div className="sortSCT">
              <div className="head">
                <div>
                  <h2>
                    <FontAwesomeIcon icon={faUser} />
                    送迎リクエスト
                  </h2>
                </div>
              </div>
              <div className="sort">
                <table className="userTable">
                  <tbody>
                    <tr>
                      <td>事業所名</td>
                      <td>{requestedCustomer.office_name}</td>
                    </tr>
                    <tr>
                      <td>日付</td>
                      <td>{requestedCustomer.date}</td>
                    </tr>
                    <tr>
                      <td>利用者名</td>
                      <td>{requestedCustomer.name}</td>
                    </tr>
                    <tr>
                      <td>利用者名カナ</td>
                      <td>{requestedCustomer.name_kana}</td>
                    </tr>
                    <tr>
                      <td>予定時間</td>
                      <td>{requestedCustomer.schedule_time}</td>
                    </tr>
                    {category !== "tourism" && category !== "education" && (
                      <tr>
                        <td>開始時間</td>
                        <td>{requestedCustomer.start_time}</td>
                      </tr>
                    )}
                    <tr>
                      <td>乗車地点</td>
                      <td>{requestedCustomer.departure_address}</td>
                    </tr>
                    <tr>
                      <td>降車地点</td>
                      <td>{requestedCustomer.arrival_address}</td>
                    </tr>
                    {category !== "tourism" && (
                      <>
                        <tr>
                          <td>車椅子</td>
                          <td>{requestedCustomer.wc ? "有" : "無"}</td>
                        </tr>
                        <tr>
                          <td>歩行器</td>
                          <td>{requestedCustomer.walker ? "有" : "無"}</td>
                        </tr>
                        <tr>
                          <td>歩行器サイズ</td>
                          <td>{requestedCustomer.walker_size}</td>
                        </tr>
                        <tr>
                          <td>助手要否</td>
                          <td>
                            {requestedCustomer.need_helper ? "要" : "不要"}
                          </td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>
              {!requestedCustomer.allowed && (
                <div className="submitbox">
                  <button type="button" className="sub" onClick={rejectRequest}>
                    <FontAwesomeIcon icon={faTrash} />
                    却下
                  </button>
                  <button type="button" onClick={approveRequest}>
                    <FontAwesomeIcon icon={faSave} />
                    承認
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RequestedCustomerModal;
