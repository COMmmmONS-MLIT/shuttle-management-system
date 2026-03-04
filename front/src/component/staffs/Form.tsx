import React, { useEffect, useState } from "react";
import Link from "next/link";
import InputField from "@/component/FormControls/InputField";
import SelectField from "@/component/FormControls/SelectField";
import CheckboxField from "@/component/FormControls/CheckboxField";
import HttpClient from "@/adapter/HttpClient";
import { useRouter } from "next/router";
import {
  SuccessToast,
  ErrorToast,
} from "@/component/ReactHotToast/ToastMessage";

// types
import { ResponseCarPatterns } from "@/types/ApiResponse/carPattern";
import { CarPattern } from "@/types/carPattern";
import { Staffs } from "@/types/staff";
import { ResponseStaffData } from "@/types/ApiResponse/staff";

// fontawesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserTie,
  faUndoAlt,
  faSave,
} from "@fortawesome/free-solid-svg-icons";

import { ApiErrorHandler } from "@/services/apiErrorHandler";

//仮 職種
const categories = [
  { label: "-----", value: "" },
  { label: "介護", value: "介護" },
  { label: "看護", value: "看護" },
  { label: "相談員", value: "相談員" },
  { label: "訓練士", value: "訓練士" },
  { label: "ドライバー", value: "ドライバー" },
  { label: "経理", value: "経理" },
  { label: "その他", value: "その他" },
];
//運転手type
const driverTypes = [
  { label: "-----", value: "" },
  { label: "介護職員", value: "介護職員" },
  { label: "専属ドライバー", value: "専属ドライバー" },
  { label: "応援", value: "応援" },
  { label: "退職", value: "退職" },
  { label: "送迎から除外", value: "送迎から除外" },
];

const defaultStaffFormValue: Staffs = {
  cd: "",
  name: "",
  name_kana: "",
  category: 0,
  can_driver: false,
  can_helper: false,
  driver_type: 0,
  mail: "",
  tel: "",
  updated_at: "",
  is_stopped: false,
  can_driving_cars: [],
};

type Props = {
  id?: string;
  carPatterns?: CarPattern[];
};

const StaffForm = ({ id }: Props) => {
  const httpClient = new HttpClient();
  const router = useRouter();
  const [staff, setStaff] = useState<Staffs>(defaultStaffFormValue);
  const [carPatternsOptions, setCarPatternsOptions] = useState<
    { label: string; value: number }[]
  >([]);
  const [staffFormErrorMessages, setStaffFormErrorMessages] = useState<any>({});

  useEffect(() => {
    if (id) {
      fetchStaff(id);
    }
    fetchCarPatterns();
  }, [id]);

  const fetchStaff = (id: string) => {
    const url = `/staffs/${id}`;
    httpClient
      .get<ResponseStaffData>(url)
      .then((response) => {
        if (response.data) {
          setStaff(response.data.staff);
          if (
            response.data.staff.can_driving_cars &&
            Array.isArray(response.data.staff.can_driving_cars)
          ) {
            const ids = response.data.staff.can_driving_cars.map(
              (item: any) => item.car_pattern.id
            );
            setSelectedCarPatternIds(ids);
          } else {
            setSelectedCarPatternIds([]);
          }
        } else {
          ErrorToast("該当するデータがありません");
          setStaff(defaultStaffFormValue);
        }
      });
  };

  const fetchCarPatterns = () => {
    const url = "/car_patterns";
    httpClient
      .get<ResponseCarPatterns>(url)
      .then((response) => {
        const carPatterns = response.data.car_patterns.map((pattern) => {
          return { label: pattern.name, value: pattern.id };
        });
        setCarPatternsOptions(carPatterns);
      });
  };

  const [selectedCarPatternIds, setSelectedCarPatternIds] = useState<number[]>(
    []
  );

  const handleCarPatternChange = (id: number) => {
    setSelectedCarPatternIds((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    try {
      // can_driving_carsをselectedCarPatternIdsとcarPatternsOptionsから組み立て
      const can_driving_cars = selectedCarPatternIds.map((id) => {
        const pattern = carPatternsOptions.find((p) => p.value === id);
        return {
          car_pattern: {
            id,
            name: pattern ? pattern.label : "",
          },
        };
      });

      // staffオブジェクトをコピーし、can_driverがtrueのときだけcan_driving_carsをセット、falseのときは削除
      const staffForRequest: any = { ...staff };
      if (staffForRequest.can_driver) {
        staffForRequest.can_driving_cars = can_driving_cars;
      } else {
        delete staffForRequest.can_driving_cars;
      }
      // updated_atを除外
      delete staffForRequest.updated_at;
      // category, driver_typeが0ならnullに変換
      if (staffForRequest.category === 0) {
        staffForRequest.category = null;
      }
      if (staffForRequest.driver_type === 0) {
        staffForRequest.driver_type = null;
      }
      const requestBody = { staff: staffForRequest };

      if (id) {
        await httpClient.put(`/staffs/${id}`, requestBody);
        SuccessToast(`${staff.name}さんを更新しました`);
      } else {
        await httpClient.post("/staffs", requestBody);
        SuccessToast(`${staff.name}さんを登録しました`);
      }
      router.push("/staffs");
    } catch (error: any) {
      const errorMessages = new ApiErrorHandler(error).getErrorMessages();
      setStaffFormErrorMessages(errorMessages);
    }
  };

  return (
    <section>
      <div className="inputSCT">
        <div className="cont">
          {id && (
            <ul className="dateList">
              <li>
                更新日：
                {new Date(staff.updated_at)
                  .toLocaleDateString("ja-JP", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  })
                  .split("/")
                  .join("-")}
              </li>
            </ul>
          )}
          <div className="inputbox">
            <div className="set">
              <div className="head">
                <h2>
                  <FontAwesomeIcon icon={faUserTie} />
                  職員
                </h2>
              </div>
              <div className="basic flex">
                <InputField
                  readOnly={Boolean(id)}
                  name="cd"
                  label="職員番号"
                  type="text"
                  labelClassName="text required"
                  inputClassName="short"
                  setState={setStaff}
                  value={staff.cd}
                  errorMessage={staffFormErrorMessages["staff.cd"] ?? ""}
                />
                <InputField
                  name="name"
                  label="職員名"
                  type="text"
                  labelClassName="text required"
                  inputClassName="middle"
                  setState={setStaff}
                  value={staff.name}
                  errorMessage={staffFormErrorMessages["staff.name"] ?? ""}
                />
                <InputField
                  name="name_kana"
                  label="職員名（カナ）"
                  type="text"
                  labelClassName="text required"
                  inputClassName="middle"
                  setState={setStaff}
                  value={staff.name_kana}
                  errorMessage={staffFormErrorMessages["staff.name_kana"] ?? ""}
                />
                <SelectField
                  label="職種カテゴリ："
                  options={categories}
                  name="category"
                  setState={setStaff}
                  value={staff.category}
                />
              </div>

              <div
                className="flex"
                style={{ alignItems: "center", gap: "1rem", marginTop: "1rem" }}
              >
                <InputField
                  name="mail"
                  label="メールアドレス"
                  type="text"
                  labelClassName="text"
                  inputClassName="middle"
                  value={staff.mail}
                  setState={setStaff}
                />
                <InputField
                  name="tel"
                  label="電話番号"
                  type="text"
                  labelClassName="text"
                  inputClassName="middle"
                  value={staff.tel}
                  setState={setStaff}
                />
                <CheckboxField
                  label="添乗可能"
                  checked={staff.can_helper}
                  trueValue={true}
                  falseValue={false}
                  setState={setStaff}
                  name="can_helper"
                />
              </div>

              <div
                className="flex"
                style={{ alignItems: "center", gap: "1rem", marginTop: "1rem" }}
              >
                <CheckboxField
                  label="運転可能"
                  checked={staff.can_driver}
                  trueValue={true}
                  falseValue={false}
                  setState={setStaff}
                  name="can_driver"
                />
                {staff.can_driver && (
                  <SelectField
                    name="driver_type"
                    label="運転手区分："
                    options={driverTypes}
                    setState={setStaff}
                    value={staff.driver_type}
                  />
                )}
              </div>
              {staff.can_driver && (
                <div
                  className="limit"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    marginTop: "1rem",
                  }}
                >
                  <legend className="required m-0">
                    <span>運転可能車両</span>
                  </legend>
                  {carPatternsOptions.map((pattern, i) => (
                    <label key={i} className="checkbox">
                      <input
                        type="checkbox"
                        onChange={() => handleCarPatternChange(pattern.value)}
                        checked={selectedCarPatternIds.includes(pattern.value)}
                      />
                      <span>{pattern.label}</span>
                    </label>
                  ))}
                  {staffFormErrorMessages["staff.can_driving_cars"] && (
                    <div className="w-100 errorMessage">
                      <span>
                        {staffFormErrorMessages["staff.can_driving_cars"] ?? ""}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {id && (
              <div className="stop">
                <h4>停止設定</h4>
                <CheckboxField
                  label="停止する"
                  checked={staff.is_stopped}
                  trueValue={true}
                  falseValue={false}
                  setState={setStaff}
                  name="is_stopped"
                />
              </div>
            )}
            <div className="submitbox">
              <Link href="/staffs">
                <button type="button" aria-label="戻る" className="sub">
                  <FontAwesomeIcon icon={faUndoAlt} />
                  戻る
                </button>
              </Link>
              <button type="button" onClick={handleSubmit}>
                <FontAwesomeIcon icon={faSave} />
                登録
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StaffForm;
