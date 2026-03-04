import { useState, useEffect } from "react";
import moment from "moment";
import InputField from "@/component/FormControls/InputField";
import TextareaField from "@/component/FormControls/TextareaField";
import SelectField from "@/component/FormControls/SelectField";
import HttpClient from "@/adapter/HttpClient";
import {
  SuccessToast,
  ErrorToast,
} from "@/component/ReactHotToast/ToastMessage";
import putUpdateTime from "@/component/soge/Requests/putUpdateTime";
import { ApiErrorHandler } from "@/services/apiErrorHandler";
import RequestVisitingsCustomer from "@/component/Visiting/RequestVisitingsCustomer";

// types
import SuccessResponse from "@/types/ApiResponse/success";
import { TourismVisitingsCustomer } from "@/types/visitingsCustomer";
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
  initialData?: TourismVisitingsCustomer;
  isEdit?: boolean;
  onSuccess: () => void;
};

const defaultTourismRegisterForm: any = {
  soge_type: "pick_up",
  schedule_time: "",
  passenger_count: 0,
  name: "",
  name_kana: "",
  phone_number: "",
  note: "",
};

const TourismRegister = ({
  setModal,
  date,
  initialData,
  isEdit = false,
  onSuccess,
}: Props) => {
  const { canRequest } = useUser();
  const [tourismRegisterForm, setTourismRegisterForm] =
    useState<TourismVisitingsCustomer>(
      initialData ? initialData : { ...defaultTourismRegisterForm, date },
    );
  const [pointOptions, setPointOptions] = useState<SelectOption[]>([]);
  const [requestModal, setRequestModal] = useState<boolean>(false);
  const [errorMessages, setErrorMessages] = useState<any>({});
  const httpClient = new HttpClient();

  useEffect(() => {
    getPointOptions();
  }, []);

  const getPointOptions = () => {
    const url = "/tourism/visitings_customers/point_options";
    httpClient.get<ResponsePointOptions>(url).then((res) => {
      setPointOptions(res.data.point_options);
      if (
        !tourismRegisterForm.base_point_id &&
        res.data.point_options &&
        res.data.point_options.length > 0
      ) {
        setTourismRegisterForm((prev) => ({
          ...prev,
          base_point_id: res.data.point_options[0].value,
        }));
      }
    });
  };

  const createIndividual = () => {
    const params = {
      visitings_customer: {
        ...tourismRegisterForm,
        date: tourismRegisterForm.date,
      },
    };

    const url = isEdit
      ? `/tourism/visitings_customers/${tourismRegisterForm.id}`
      : "/tourism/visitings_customers";
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
    if (!tourismRegisterForm.id) {
      ErrorToast("削除対象のIDがありません");
      return;
    }

    const url = `/tourism/visitings_customers/${tourismRegisterForm.id}`;

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
                visitingsCustomerIds={[tourismRegisterForm.id!]}
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
                      tourismRegisterForm.id &&
                      !tourismRegisterForm.is_requested && (
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
                        value={tourismRegisterForm.soge_type}
                        name="soge_type"
                        setState={setTourismRegisterForm}
                        disabled={isEdit}
                        errorMessage={errorMessages["soge_type"] ?? ""}
                      />
                      <InputField
                        name="date"
                        label="日付:"
                        type="date"
                        labelClassName="date"
                        setState={setTourismRegisterForm}
                        readOnly={isEdit}
                        value={
                          isEdit && initialData?.date
                            ? initialData.date.replace(/\//g, "-")
                            : tourismRegisterForm.date
                        }
                        errorMessage={errorMessages["date"] ?? ""}
                      />
                    </fieldset>
                    <fieldset className="basic flex">
                      <InputField
                        name="name"
                        label="利用者："
                        type="text"
                        labelClassName="text"
                        value={tourismRegisterForm.name}
                        setState={setTourismRegisterForm}
                        errorMessage={errorMessages["name"] ?? ""}
                      />
                      <InputField
                        name="name_kana"
                        label="フリガナ"
                        type="text"
                        labelClassName="text"
                        setState={setTourismRegisterForm}
                        value={tourismRegisterForm.name_kana}
                        errorMessage={errorMessages["name_kana"] ?? ""}
                      />
                      <InputField
                        name="phone_number"
                        label="電話番号："
                        type="text"
                        labelClassName="text"
                        setState={setTourismRegisterForm}
                        value={tourismRegisterForm.phone_number}
                        errorMessage={errorMessages["phone_number"] ?? ""}
                      />
                    </fieldset>
                    <fieldset className="basic flex">
                      {isEdit ? (
                        <>
                          <InputField
                            name="office_name"
                            label="乗車地点： "
                            type="text"
                            labelClassName="text"
                            value={
                              tourismRegisterForm.soge_type === "pick_up"
                                ? tourismRegisterForm.base_point_name
                                : tourismRegisterForm.point_name
                            }
                            setState={setTourismRegisterForm}
                            readOnly={true}
                            errorMessage={errorMessages["office_name"] ?? ""}
                          />
                          <InputField
                            name="office_name"
                            label="降車地点： "
                            type="text"
                            labelClassName="text"
                            value={
                              tourismRegisterForm.soge_type === "pick_up"
                                ? tourismRegisterForm.point_name
                                : tourismRegisterForm.base_point_name
                            }
                            setState={setTourismRegisterForm}
                            readOnly={true}
                            errorMessage={errorMessages["office_name"] ?? ""}
                          />
                        </>
                      ) : (
                        <SelectField
                          name="base_point_id"
                          label={
                            tourismRegisterForm.soge_type === "drop_off"
                              ? "降車場所： "
                              : "乗車場所： "
                          }
                          value={tourismRegisterForm.base_point_id}
                          options={pointOptions}
                          setState={setTourismRegisterForm}
                          disabled={isEdit}
                          errorMessage={errorMessages["base_point_id"] ?? ""}
                        />
                      )}
                    </fieldset>
                    <fieldset className="basic flex">
                      <InputField
                        name="schedule_time"
                        label="予定時間："
                        type="time"
                        labelClassName="time"
                        setState={setTourismRegisterForm}
                        value={tourismRegisterForm.schedule_time}
                        errorMessage={errorMessages["schedule_time"] ?? ""}
                      />
                      <InputField
                        name="passenger_count"
                        label="乗車人数："
                        type="number"
                        labelClassName="text"
                        setState={setTourismRegisterForm}
                        value={tourismRegisterForm.passenger_count}
                        errorMessage={errorMessages["passenger_count"] ?? ""}
                      />
                    </fieldset>
                    <fieldset className="basic flex">
                      <TextareaField
                        name="note"
                        label="備考："
                        labelClassName="text"
                        setState={setTourismRegisterForm}
                        value={tourismRegisterForm.note}
                        style={{
                          border: "none",
                          borderRadius: "4px",
                          minWidth: "400px",
                          minHeight: "70px",
                        }}
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
                    tourismRegisterForm.can_request &&
                    !tourismRegisterForm.is_requested && (
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

export default TourismRegister;
