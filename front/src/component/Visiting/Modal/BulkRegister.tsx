import { useState } from "react";
import moment from "moment";
import InputField from "@/component/FormControls/InputField";
import AsyncSelectField from "@/component/FormControls/AsyncSelectField";
import HttpClient from "@/adapter/HttpClient";
import { SuccessToast } from "@/component/ReactHotToast/ToastMessage";
import { useUser } from "@/contexts/UserContext";
import loadCustomerOptions from "@/component/Visiting/Request/loadCustomerOptions";

// types
import SuccessResponse from "@/types/ApiResponse/success";
import { BulkRegisterForm } from "@/types/visitingsCustomer";

// fontawesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers, faSave } from "@fortawesome/free-solid-svg-icons";

import { ApiErrorHandler } from "@/services/apiErrorHandler";

type Props = {
  setModal: React.Dispatch<React.SetStateAction<string | null>>;
  onSuccess: () => void;
};

const defaultBulkRegisterForm: BulkRegisterForm = {
  start_date: moment().format("YYYY-MM-DD"),
  end_date: moment().endOf("month").format("YYYY-MM-DD"),
  customer_cd: "",
};

const BulkRegister = ({ setModal, onSuccess }: Props) => {
  const { category } = useUser();
  const [bulkRegisterForm, setBulkRegisterForm] = useState(
    defaultBulkRegisterForm,
  );
  const [errorMessages, setErrorMessages] = useState<any>({});
  const httpClient = new HttpClient();

  const bulkCreate = () => {
    const params = {
      visitings_customer_bulk_create: bulkRegisterForm,
    };
    const url =
      category === "education"
        ? "/education/visitings_customers/bulk_create"
        : "/visitings_customers/bulk_create";
    httpClient
      .post<SuccessResponse>(url, params)
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
          <div className="inner wide USERS">
            <div className="sortSCT">
              <div className="head">
                <h2>
                  <FontAwesomeIcon icon={faUsers} />
                  一括登録
                </h2>
              </div>
              <div className="sort">
                <div className="searchbox">
                  <label>期間</label>
                  <InputField
                    name="start_date"
                    type="date"
                    labelClassName="date"
                    setState={setBulkRegisterForm}
                    value={bulkRegisterForm.start_date}
                    errorMessage={
                      errorMessages["visitings_customer.start_date"] ?? ""
                    }
                  />
                  〜
                  <InputField
                    name="end_date"
                    type="date"
                    labelClassName="date"
                    setState={setBulkRegisterForm}
                    value={bulkRegisterForm.end_date}
                    errorMessage={
                      errorMessages["visitings_customer.end_date"] ?? ""
                    }
                  />
                  <AsyncSelectField
                    name="customer_cd"
                    label="利用者番号:"
                    labelClassName="keyword"
                    placeholder="名前、カナ、利用者番号を入力"
                    setState={setBulkRegisterForm}
                    value={bulkRegisterForm.customer_cd}
                    errorMessage={errorMessages["visitings_customer.cd"] ?? ""}
                    loadOptions={loadCustomerOptions}
                    defaultOptions={[]}
                    isClearable={true}
                  />
                </div>
              </div>
              <div className="submitbox">
                <button type="button" onClick={bulkCreate}>
                  <FontAwesomeIcon icon={faSave} />
                  登録
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BulkRegister;
