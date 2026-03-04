import { useState, useEffect } from "react";
import moment from "moment";
import InputField from "@/component/FormControls/InputField";
import CheckboxField from "@/component/FormControls/CheckboxField";
import SelectField from "@/component/FormControls/SelectField";
import AsyncSelectField from "../../FormControls/AsyncSelectField";
import HttpClient from "@/adapter/HttpClient";
import loadCustomerOptions from "@/component/Visiting/Request/loadCustomerOptions";
import {
  SuccessToast,
  ErrorToast,
} from "@/component/ReactHotToast/ToastMessage";
import putUpdateTime from "@/component/soge/Requests/putUpdateTime";
import RequestVisitingsCustomer from "@/component/Visiting/RequestVisitingsCustomer";

// types
import SuccessResponse from "@/types/ApiResponse/success";
import { IndividualRegisterForm } from "@/types/visitingsCustomer";
import { ResponseVcPointOptions } from "@/types/ApiResponse/visiting";

// fontawesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faSave,
  faTrash,
  faCar,
} from "@fortawesome/free-solid-svg-icons";

import { ApiErrorHandler } from "@/services/apiErrorHandler";

// context
import { useUser } from "@/contexts/UserContext";

type Props = {
  setModal: React.Dispatch<React.SetStateAction<string | null>>;
  date: string;
  initialData?: IndividualRegisterForm;
  isEdit?: boolean;
  onSuccess: () => void;
};

const defaultIndividualRegisterForm: IndividualRegisterForm = {
  customer_cd: "",
  departure_time: "",
  start_time: "",
  arrival_time: "",
  self_pick_up: false,
  self_drop_off: false,
  is_absent: false,
  absence_reason: "",
  pick_up_point_id: undefined,
  drop_off_point_id: undefined,
  pick_up_base_point_id: undefined,
  drop_off_base_point_id: undefined,
  pick_up_request: false,
  drop_off_request: false,
};

const IndividualRegister = ({
  setModal,
  date,
  initialData,
  isEdit = false,
  onSuccess,
}: Props) => {
  const [individualRegisterForm, setIndividualRegisterForm] = useState(
    initialData ? initialData : { ...defaultIndividualRegisterForm, date },
  );
  const [pointOptions, setPointOptions] = useState<
    { label: string; value: string | number; is_office: boolean }[]
  >([]);
  const [addressOptions, setAddressOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [requestModal, setRequestModal] = useState<boolean>(false);
  const [errorMessages, setErrorMessages] = useState<any>({});
  const [customerOptions, setCustomerOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const httpClient = new HttpClient();
  const { canRequest } = useUser();

  useEffect(() => {
    getVcPointOptions();
    if (isEdit && individualRegisterForm.customer_id) {
      getAddressOptions();
    }
    if (isEdit && initialData?.customer_cd) {
      setCustomerOptions([
        {
          label: initialData.customer_cd,
          value: initialData.customer_cd,
        },
      ]);
    }
  }, []);

  useEffect(() => {
    setErrorMessages({});
  }, [individualRegisterForm]);

  const getVcPointOptions = () => {
    const url = "/visitings_customers/point_options";
    httpClient
      .get<ResponseVcPointOptions>(url)
      .then((res) => {
        setPointOptions(res.data.point_options);

        if (!isEdit && res.data.point_options.length > 0) {
          const officePoint = res.data.point_options.find(
            (point) => point.is_office,
          );
          const officePointId = officePoint
            ? officePoint.value
            : res.data.point_options[0].value;

          setIndividualRegisterForm((prev) => ({
            ...prev,
            pick_up_base_point_id: officePointId,
            drop_off_base_point_id: officePointId,
          }));
        }
      })
      .catch(() => {
        ErrorToast("地点の取得に失敗しました");
      });
  };

  const getAddressOptions = () => {
    if (!individualRegisterForm.customer_id) return;

    const url = `/customers/${individualRegisterForm.customer_id}/customer_bookmarks_options`;
    httpClient
      .get<{ customer_bookmarks: { label: string; value: string }[] }>(url)
      .then((res) => {
        setAddressOptions(res.data.customer_bookmarks);
      })
      .catch(() => {
        ErrorToast("地点の取得に失敗しました");
      });
  };

  const createIndividual = () => {
    const params = {
      visitings_customer: {
        ...individualRegisterForm,
        date: individualRegisterForm.date,
      },
    };

    const url = isEdit
      ? `/visitings_customers/${individualRegisterForm.id}`
      : "/visitings_customers";
    const method = isEdit ? "put" : "post";

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

  const deleteVisitingCustomer = () => {
    if (!individualRegisterForm.id) {
      ErrorToast("削除対象のIDがありません");
      return;
    }

    const url = `/visitings_customers/${individualRegisterForm.id}`;

    if (!confirm("この送迎データを削除しますか？")) {
      return;
    }

    httpClient
      .delete<SuccessResponse>(url)
      .then((res) => {
        SuccessToast(res.data.messages);
        onSuccess();
        setModal(null);
      })
      .catch((error) => {
        if (error.response?.status === 409) {
          if (
            confirm("この送迎データは便に紐づけられています。削除しますか？")
          ) {
            httpClient
              .delete<SuccessResponse>(`${url}?force=true`)
              .then(async (res) => {
                SuccessToast(res.data.messages);
                onSuccess();
                setModal(null);
              })
              .catch((e) => console.log(e));
          }
        } else {
          const errors = error.response?.data?.errors;
          ErrorToast(errors);
        }
      });
  };

  return (
    <section>
      <div className="modalSCT active">
        <div className="mask" onClick={() => setModal(null)}></div>
        <div className="cont">
          <div className="close" onClick={() => setModal(null)}></div>
          <div className="inner wide USER">
            {requestModal ? (
              <RequestVisitingsCustomer
                visitingsCustomerIds={[individualRegisterForm.id!]}
                onSuccess={() => {
                  onSuccess();
                  setModal(null);
                }}
                onCancel={() => setRequestModal(false)}
              />
            ) : (
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
                      <FontAwesomeIcon icon={faUser} />
                      {isEdit ? "編集" : "個別登録"}
                    </h2>
                    {isEdit && individualRegisterForm.id && (
                      <button
                        type="button"
                        onClick={deleteVisitingCustomer}
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
                    <fieldset>
                      <InputField
                        name="date"
                        label="日付:"
                        type="date"
                        labelClassName="date"
                        setState={setIndividualRegisterForm}
                        readOnly={isEdit}
                        value={
                          isEdit && initialData?.date
                            ? initialData.date.replace(/\//g, "-")
                            : individualRegisterForm.date
                        }
                        errorMessage={
                          errorMessages["visitings_customer.date"] ?? ""
                        }
                      />
                      <AsyncSelectField
                        name="customer_cd"
                        label="利用者番号:"
                        labelClassName="keyword"
                        placeholder="名前、カナ、利用者番号を入力"
                        setState={setIndividualRegisterForm}
                        value={individualRegisterForm.customer_cd}
                        errorMessage={
                          errorMessages["visitings_customer.cd"] ?? ""
                        }
                        loadOptions={loadCustomerOptions}
                        defaultOptions={customerOptions}
                        isClearable={true}
                        isDisabled={isEdit}
                      />
                    </fieldset>
                    <fieldset>
                      <InputField
                        name="departure_time"
                        label="迎え時間："
                        type="time"
                        labelClassName="time"
                        setState={setIndividualRegisterForm}
                        value={individualRegisterForm.departure_time}
                        errorMessage={
                          errorMessages["visitings_customer.departure_time"] ??
                          ""
                        }
                      />
                      <InputField
                        name="start_time"
                        label="開始時間："
                        type="time"
                        labelClassName="time"
                        setState={setIndividualRegisterForm}
                        value={individualRegisterForm.start_time}
                        errorMessage={
                          errorMessages["visitings_customer.start_time"] ?? ""
                        }
                      />
                      <InputField
                        name="arrival_time"
                        labelClassName="time"
                        label="終了時間："
                        type="time"
                        setState={setIndividualRegisterForm}
                        value={individualRegisterForm.arrival_time}
                        errorMessage={
                          errorMessages["visitings_customer.arrival_time"] ?? ""
                        }
                      />
                    </fieldset>
                    <fieldset>
                      <CheckboxField
                        name="self_pick_up"
                        label="自来"
                        trueValue={true}
                        falseValue={false}
                        setState={setIndividualRegisterForm}
                        checked={individualRegisterForm.self_pick_up}
                      />
                      <CheckboxField
                        name="self_drop_off"
                        label="自退"
                        trueValue={true}
                        falseValue={false}
                        setState={setIndividualRegisterForm}
                        checked={individualRegisterForm.self_drop_off}
                      />
                    </fieldset>
                    <fieldset>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <CheckboxField
                          name="is_absent"
                          label="休み"
                          trueValue={true}
                          falseValue={false}
                          setState={setIndividualRegisterForm}
                          checked={individualRegisterForm.is_absent as boolean}
                        />
                        {individualRegisterForm.is_absent && (
                          <div>
                            <InputField
                              name="absence_reason"
                              label="休み理由："
                              type="text"
                              labelClassName="keyword"
                              placeholder="休み理由を入力"
                              setState={setIndividualRegisterForm}
                              value={individualRegisterForm.absence_reason}
                            />
                          </div>
                        )}
                      </div>
                    </fieldset>
                    <fieldset>
                      <div style={{ display: "flex", gap: "16px" }}>
                        <div>
                          <SelectField
                            label="迎え降車場所："
                            options={pointOptions}
                            value={individualRegisterForm.pick_up_base_point_id}
                            name="pick_up_base_point_id"
                            setState={setIndividualRegisterForm}
                          />
                        </div>
                        <div>
                          <SelectField
                            label="送り乗車場所："
                            options={pointOptions}
                            value={
                              individualRegisterForm.drop_off_base_point_id
                            }
                            name="drop_off_base_point_id"
                            setState={setIndividualRegisterForm}
                          />
                        </div>
                      </div>
                    </fieldset>

                    {isEdit && addressOptions.length > 0 && (
                      <div
                        style={{
                          display: "flex",
                          gap: "16px",
                          marginTop: "10px",
                        }}
                      >
                        <div>
                          <SelectField
                            label="迎え乗車地点："
                            options={addressOptions}
                            value={individualRegisterForm.pick_up_point_id}
                            name="pick_up_point_id"
                            setState={setIndividualRegisterForm}
                          />
                        </div>
                        <div>
                          <SelectField
                            label="送り降車地点："
                            options={addressOptions}
                            value={individualRegisterForm.drop_off_point_id}
                            name="drop_off_point_id"
                            setState={setIndividualRegisterForm}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="submitbox">
                  <button type="button" onClick={createIndividual}>
                    <FontAwesomeIcon icon={faSave} />
                    {isEdit ? "更新" : "登録"}
                  </button>
                  {isEdit &&
                    canRequest &&
                    individualRegisterForm.can_request &&
                    !individualRegisterForm.is_requested && (
                      <button
                        type="button"
                        onClick={() => setRequestModal(true)}
                      >
                        <FontAwesomeIcon icon={faCar} />
                        送迎リクエスト
                      </button>
                    )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default IndividualRegister;
