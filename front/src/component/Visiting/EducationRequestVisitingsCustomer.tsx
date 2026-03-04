import { useState, useEffect } from "react";
import HttpClient from "@/adapter/HttpClient";
import SelectField from "@/component/FormControls/SelectField";
import {
  SuccessToast,
  ErrorToast,
} from "@/component/ReactHotToast/ToastMessage";

// types
import SuccessResponse from "@/types/ApiResponse/success";
import { ResponseAcceptOfficeOptions } from "@/types/ApiResponse/tourism";
import { SelectOption } from "@/types/FormControll/selectOption";

// fontawesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCar } from "@fortawesome/free-solid-svg-icons";

type Props = {
  visitingsCustomerIds: number[];
  onSuccess: () => void;
  onCancel: () => void;
};

const EducationRequestVisitingsCustomer = ({
  visitingsCustomerIds,
  onSuccess,
  onCancel,
}: Props) => {
  const [acceptOfficeOptions, setAcceptOfficeOptions] = useState<
    SelectOption[]
  >([]);
  const [selectedAcceptOffice, setSelectedAcceptOffice] = useState<number>();
  const httpClient = new HttpClient();

  useEffect(() => {
    getAcceptOfficeOptions();
  }, []);

  const getAcceptOfficeOptions = () => {
    const url = "/education/visitings_customers/accept_office_options";
    httpClient
      .get<ResponseAcceptOfficeOptions>(url)
      .then((res) => {
        setAcceptOfficeOptions(res.data.accept_office_options);
        setSelectedAcceptOffice(res.data.accept_office_options[0].value);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const onRequest = () => {
    if (!confirm(`送迎リクエストを送信しますか？`)) {
      return;
    }

    const url = `/education/visitings_customers/request_visitings_customer`;
    const params = {
      visitings_customer_ids: visitingsCustomerIds,
      accept_office_id: selectedAcceptOffice,
    };
    httpClient
      .post<SuccessResponse>(url, params)
      .then((res) => {
        SuccessToast(res.data.messages);
        onSuccess();
      })
      .catch((error) => {
        ErrorToast("送迎リクエストの送信に失敗しました");
        console.log(error);
      });
  };

  return (
    <div className="sortSCT">
      <div className="head">
        <div
          style={{
            width: "100%",
            minWidth: "600px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2>
            <FontAwesomeIcon icon={faCar} />
            リクエスト先選択
          </h2>
        </div>
      </div>
      <div className="sort">
        <div className="searchbox">
          <fieldset className="basic flex">
            <SelectField
              label="リクエスト先："
              options={acceptOfficeOptions}
              value={selectedAcceptOffice}
              setState={setSelectedAcceptOffice}
              style={{ minWidth: "200px" }}
            />
          </fieldset>
        </div>
      </div>
      <div className="submitbox">
        <button type="button" onClick={onCancel} className="sub">
          キャンセル
        </button>
        <button type="button" onClick={onRequest}>
          <FontAwesomeIcon icon={faCar} />
          送迎リクエスト
        </button>
      </div>
    </div>
  );
};

export default EducationRequestVisitingsCustomer;
