import { useState, useEffect } from "react";
import InputField from "@/component/FormControls/InputField";
import SelectField from "@/component/FormControls/SelectField";
import HttpClient from "@/adapter/HttpClient";
import {
  SuccessToast,
  ErrorToast,
} from "@/component/ReactHotToast/ToastMessage";
import { ApiErrorHandler } from "@/services/apiErrorHandler";
import EducationRequestVisitingsCustomer from "@/component/Visiting/EducationRequestVisitingsCustomer";
import AsyncSelectField from "@/component/FormControls/AsyncSelectField";
import loadCustomerOptions from "@/component/Visiting/Request/loadCustomerOptions";

// types
import SuccessResponse from "@/types/ApiResponse/success";
import { EducationVisitingsCustomer } from "@/types/visitingsCustomer";
import { ResponsePointOptions } from "@/types/ApiResponse/tourism";
import { SelectOption } from "@/types/FormControll/selectOption";

// fontawesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave, faCar, faTrash } from "@fortawesome/free-solid-svg-icons";

// context
import { useUser } from "@/contexts/UserContext";

const sogeTypeOptions = [
  { label: "迎え", value: "pick_up" },
  { label: "送り", value: "drop_off" },
];

type Props = {
  setModal: React.Dispatch<React.SetStateAction<string | null>>;
  date: string;
  initialData?: EducationVisitingsCustomer;
  isEdit?: boolean;
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

const EducationRegister = ({
  setModal,
  date,
  initialData,
  isEdit = false,
  onSuccess,
}: Props) => {
  const [educationRegisterForm, setEducationRegisterForm] =
    useState<EducationVisitingsCustomer>(
      initialData ? initialData : { ...defaultEducationRegisterForm, date },
    );
  const [pointOptions, setPointOptions] = useState<SelectOption[]>([]);
  const [requestModal, setRequestModal] = useState<boolean>(false);
  const [errorMessages, setErrorMessages] = useState<any>({});
  const httpClient = new HttpClient();
  const { canRequest } = useUser();
  useEffect(() => {
    getPointOptions();
  }, []);

  const getPointOptions = () => {
    const url = "/education/visitings_customers/point_options";
    httpClient.get<ResponsePointOptions>(url).then((res) => {
      setPointOptions(res.data.point_options);
      if (!educationRegisterForm.base_point_id) {
        const officePoint = res.data.point_options.find(
          (point) => point.is_office,
        );
        const officePointId = officePoint
          ? officePoint.value
          : res.data.point_options[0].value;

        setEducationRegisterForm((prev) => ({
          ...prev,
          base_point_id: officePointId,
        }));
      }
    });
  };

  const createIndividual = () => {
    const params = {
      visitings_customer: {
        ...educationRegisterForm,
        date: educationRegisterForm.date,
      },
    };

    const url = isEdit
      ? `/education/visitings_customers/${educationRegisterForm.id}`
      : "/education/visitings_customers";
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
    if (!educationRegisterForm.id) {
      ErrorToast("削除対象のIDがありません");
      return;
    }

    const url = `/education/visitings_customers/${educationRegisterForm.id}`;

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
          const visitings = error.response.data.visitings;

          if (
            confirm("この送迎データは便に紐づけられています。削除しますか？")
          ) {
            httpClient
              .delete<SuccessResponse>(`${url}?force=true`)
              .then((res) => {
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
              <EducationRequestVisitingsCustomer
                visitingsCustomerIds={[educationRegisterForm.id!]}
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
                      <FontAwesomeIcon icon={faCar} />
                      {isEdit ? "編集" : "送迎登録"}
                    </h2>
                    {isEdit &&
                      educationRegisterForm.id &&
                      !educationRegisterForm.is_requested && (
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
                    <fieldset className="basic flex">
                      <SelectField
                        label="送迎種別："
                        options={sogeTypeOptions}
                        value={educationRegisterForm.soge_type}
                        name="soge_type"
                        setState={setEducationRegisterForm}
                        disabled={isEdit}
                        errorMessage={errorMessages["soge_type"] ?? ""}
                      />
                      <InputField
                        name="date"
                        label="日付:"
                        type="date"
                        labelClassName="date"
                        setState={setEducationRegisterForm}
                        readOnly={isEdit}
                        value={
                          isEdit && initialData?.date
                            ? initialData.date.replace(/\//g, "-")
                            : educationRegisterForm.date
                        }
                        errorMessage={errorMessages["date"] ?? ""}
                      />
                      <AsyncSelectField
                        name="customer_cd"
                        label="利用者番号:"
                        labelClassName="keyword"
                        placeholder="名前、カナ、利用者番号を入力"
                        setState={setEducationRegisterForm}
                        value={educationRegisterForm.customer_cd}
                        errorMessage={errorMessages["customer_cd"] ?? ""}
                        loadOptions={loadCustomerOptions}
                        defaultOptions={[]}
                        isClearable={true}
                        isDisabled={isEdit}
                      />
                    </fieldset>
                    <fieldset className="basic flex">
                      {isEdit &&
                        educationRegisterForm.addresses_options.length > 0 && (
                          <SelectField
                            label={
                              educationRegisterForm.soge_type === "pick_up"
                                ? "乗車場所："
                                : "降車場所："
                            }
                            options={educationRegisterForm.addresses_options}
                            value={educationRegisterForm.point_id}
                            name="point_id"
                            setState={setEducationRegisterForm}
                          />
                        )}
                      <SelectField
                        label={
                          educationRegisterForm.soge_type === "pick_up"
                            ? "降車場所："
                            : "乗車場所："
                        }
                        options={pointOptions}
                        value={educationRegisterForm.base_point_id}
                        name="base_point_id"
                        setState={setEducationRegisterForm}
                      />
                    </fieldset>
                    <fieldset className="basic flex">
                      <InputField
                        name="schedule_time"
                        label="予定時間："
                        type="time"
                        labelClassName="time"
                        setState={setEducationRegisterForm}
                        value={educationRegisterForm.schedule_time}
                        errorMessage={errorMessages["schedule_time"] ?? ""}
                      />
                    </fieldset>
                  </div>
                </div>
                <div className="submitbox">
                  <button type="button" onClick={createIndividual}>
                    <FontAwesomeIcon icon={faSave} />
                    {isEdit ? "更新" : "登録"}
                  </button>
                  {isEdit &&
                    canRequest &&
                    educationRegisterForm.can_request &&
                    !educationRegisterForm.is_requested && (
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

export default EducationRegister;
