import { useState, useEffect } from "react";
import TextareaField from "@/component/FormControls/TextareaField";
import SelectField from "@/component/FormControls/SelectField";
import HttpClient from "@/adapter/HttpClient";
import {
  SuccessToast,
  ErrorToast,
} from "@/component/ReactHotToast/ToastMessage";

// types
import SuccessResponse from "@/types/ApiResponse/success";
import { CustomerNg, CustomerNgForm } from "@/types/customerNg";
import { CustomerOptionsResponse } from "@/types/ApiResponse/customerNg";
import { SelectOption } from "@/types/FormControll/selectOption";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave, faSearch, faTrash } from "@fortawesome/free-solid-svg-icons";

type Props = {
  setModal: React.Dispatch<React.SetStateAction<string | null>>;
  initialData?: CustomerNg;
  isEdit?: boolean;
  onSuccess: () => void;
};

const defaultCustomerNgForm: CustomerNgForm = {
  customer_a_id: 0,
  customer_b_id: 0,
  reason: "",
};

const CustomerNgRegister = ({
  setModal,
  initialData,
  isEdit = false,
  onSuccess,
}: Props) => {
  const [customerNgForm, setCustomerNgForm] = useState<CustomerNgForm>(
    initialData
      ? {
          customer_a_id: initialData.customer_a_id,
          customer_b_id: initialData.customer_b_id,
          reason: initialData.reason,
        }
      : defaultCustomerNgForm
  );
  const [customerOptions, setCustomerOptions] = useState<SelectOption[]>([]);
  const httpClient = new HttpClient();

  useEffect(() => {
    getCustomerOptions();
  }, []);

  const getCustomerOptions = () => {
    const url = "/customer_ngs/customer_options";
    httpClient
      .get<CustomerOptionsResponse>(url)
      .then((res) => {
        setCustomerOptions(res.data.customer_options);
        if (!customerNgForm.customer_a_id) {
          setCustomerNgForm((prev) => ({
            ...prev,
            customer_a_id: res.data.customer_options[0].value,
          }));
        }
        if (!customerNgForm.customer_b_id) {
          setCustomerNgForm((prev) => ({
            ...prev,
            customer_b_id: res.data.customer_options[1].value,
          }));
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleSubmit = () => {
    const params = {
      customer_ng: customerNgForm,
    };

    const url = isEdit
      ? `/customer_ngs/${initialData?.id}`
      : "/customer_ngs";
    const method = isEdit ? "put" : "post";

    httpClient[method]<SuccessResponse>(url, params)
      .then((res) => {
        SuccessToast(res.data.messages);
        onSuccess();
        setModal(null);
      })
      .catch((error) => {
        const errorMessages = error.response?.data?.full_messages || ["保存に失敗しました"];
        ErrorToast(errorMessages);
      });
  };

  const deleteCustomerNg = () => {
    if (!confirm("この乗り合わせ設定を削除しますか？")) {
      return;
    }

    const url = `/customer_ngs/${initialData?.id}`;

    httpClient
      .delete<SuccessResponse>(url)
      .then((res) => {
        SuccessToast(res.data.messages);
        onSuccess();
        setModal(null);
      })
      .catch((error) => {
        console.log(error);
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
                    <FontAwesomeIcon icon={faSearch} />
                    {isEdit ? "乗り合わせ編集" : "乗り合わせ登録"}
                  </h2>
                  {isEdit && initialData?.id && (
                    <button
                      type="button"
                      onClick={deleteCustomerNg}
                      style={{
                        background: "#dc3545",
                        color: "white",
                      }}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                      削除
                    </button>
                  )}
                </div>
              </div>
              <div className="sort">
                <div className="searchbox">
                  <fieldset className="basic flex">
                    <SelectField
                      name="customer_a_id"
                      label="対象者A："
                      value={customerNgForm.customer_a_id}
                      options={customerOptions.filter(
                        (option) => option.value !== customerNgForm.customer_b_id
                      )}
                      setState={setCustomerNgForm}
                    />
                    <SelectField
                      name="customer_b_id"
                      label="対象者B："
                      value={customerNgForm.customer_b_id}
                      options={customerOptions.filter(
                        (option) => option.value !== customerNgForm.customer_a_id
                      )}
                      setState={setCustomerNgForm}
                    />
                  </fieldset>
                  <TextareaField
                    label="NG理由："
                    name="reason"
                    labelClassName="textarea"
                    value={customerNgForm.reason}
                    setState={setCustomerNgForm}
                    fullWidth={true}
                  />
                </div>
              </div>
              <div className="submitbox">
                <button type="button" onClick={handleSubmit}>
                  <FontAwesomeIcon icon={faSave} />
                  {isEdit ? "更新" : "登録"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CustomerNgRegister;
