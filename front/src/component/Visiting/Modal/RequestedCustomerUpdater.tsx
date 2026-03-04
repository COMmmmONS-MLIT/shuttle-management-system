import { useState } from "react";
import InputField from "@/component/FormControls/InputField";
import SelectField from "@/component/FormControls/SelectField";
import HttpClient from "@/adapter/HttpClient";
import { SuccessToast } from "@/component/ReactHotToast/ToastMessage";
import { ApiErrorHandler } from "@/services/apiErrorHandler";

// types
import SuccessResponse from "@/types/ApiResponse/success";
import { RequestedVisitingsCustomer } from "@/types/visitingsCustomer";

// fontawesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave, faCar } from "@fortawesome/free-solid-svg-icons";

const sogeTypeOptions = [
  { label: "迎え", value: "pick_up" },
  { label: "送り", value: "drop_off" },
];

type Props = {
  setModal: React.Dispatch<React.SetStateAction<string | null>>;
  date: string;
  initialData?: RequestedVisitingsCustomer;
  onSuccess: () => void;
};

const defaultEducationRegisterForm: any = {
  soge_type: "pick_up",
  schedule_time: "",
  passenger_count: 0,
  name: "",
  name_kana: "",
  phone_number: "",
  base_point_id: "",
  point_id: "",
};

const RequestedCustomerUpdater = ({
  setModal,
  date,
  initialData,
  onSuccess,
}: Props) => {
  const [visitingCustomer, setVisitingCustomer] =
    useState<RequestedVisitingsCustomer>(
      initialData ? initialData : defaultEducationRegisterForm,
    );
  const [errorMessages, setErrorMessages] = useState<any>({});
  const httpClient = new HttpClient();

  const updateRequestedCustomer = () => {
    const params = {
      requested_visitings_customer: {
        schedule_time: visitingCustomer.schedule_time,
      },
    };

    const url = `/visitings_customers/${visitingCustomer.id}/update_requested_customer`;
    const method = "put";

    httpClient[method]<SuccessResponse>(url, params)
      .then((res) => {
        SuccessToast(res.data.messages);
        onSuccess();
        setModal(null);
      })
      .catch((error) => {
        const errorMessages = new ApiErrorHandler(error).getErrorMessages();
        setErrorMessages(errorMessages);
      });
  };

  return (
    <section>
      <div className="modalSCT active">
        <div className="mask" onClick={() => setModal(null)}></div>
        <div className="cont">
          <div className="close" onClick={() => setModal(null)}></div>
          <div className="inner wide USER">
            <div className="sortSCT">
              <div className="head">
                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <h2>
                    <FontAwesomeIcon icon={faCar} />
                    送迎登録
                  </h2>
                </div>
              </div>
              <div className="sort">
                <div className="searchbox">
                  <fieldset className="basic flex">
                    <SelectField
                      label="送迎種別："
                      options={sogeTypeOptions}
                      value={visitingCustomer.soge_type}
                      name="soge_type"
                      setState={setVisitingCustomer}
                      disabled={true}
                      errorMessage={errorMessages["soge_type"] ?? ""}
                    />
                    <InputField
                      label="日付:"
                      type="date"
                      labelClassName="date"
                      setState={setVisitingCustomer}
                      value={date}
                      readOnly={true}
                      errorMessage={errorMessages["date"] ?? ""}
                    />
                    <InputField
                      name="customer_cd"
                      label="利用者:"
                      type="search"
                      labelClassName="keyword"
                      placeholder="IDを入力"
                      setState={setVisitingCustomer}
                      value={visitingCustomer.customer_cd}
                      readOnly={true}
                    />
                  </fieldset>
                  <fieldset className="basic flex">
                    <InputField
                      name="point_name"
                      label="地点:"
                      type="search"
                      labelClassName="keyword"
                      setState={setVisitingCustomer}
                      value={visitingCustomer.point_name}
                      readOnly={true}
                    />
                    <InputField
                      name="base_point_name"
                      label="拠点:"
                      type="search"
                      labelClassName="keyword"
                      setState={setVisitingCustomer}
                      value={visitingCustomer.base_point_name}
                      readOnly={true}
                    />
                  </fieldset>
                  <fieldset className="basic flex">
                    <InputField
                      name="schedule_time"
                      label="予定時間："
                      type="time"
                      labelClassName="time"
                      setState={setVisitingCustomer}
                      value={visitingCustomer.schedule_time}
                      errorMessage={errorMessages["schedule_time"] ?? ""}
                    />
                  </fieldset>
                </div>
              </div>
              <div className="submitbox">
                <button type="button" onClick={updateRequestedCustomer}>
                  <FontAwesomeIcon icon={faSave} />
                  更新
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RequestedCustomerUpdater;
