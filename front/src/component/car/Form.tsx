import React from "react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import HttpClient from "@/adapter/HttpClient";
import Link from "next/link";
import InputField from "@/component/FormControls/InputField";
import CheckboxField from "@/component/FormControls/CheckboxField";
import SelectField from "@/component/FormControls/SelectField";
import SeatPatternImages from "@/component/car/SeatPatternImages";

//types
import { Car } from "@/types/car";
import { CarRestriction } from "@/types/carRestriction";
import { CarPattern } from "@/types/carPattern";
import { SelectOption } from "@/types/FormControll/selectOption";
import { ResponseCarPatterns } from "@/types/ApiResponse/carPattern";
import { ResponseCarRestrictions } from "@/types/ApiResponse/carRestriction";
import { ResponseVcPointOptions } from "@/types/ApiResponse/visiting";

// font awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClipboardCheck,
  faClipboardList,
  faShuttleVan,
  faUndoAlt,
  faSave,
} from "@fortawesome/free-solid-svg-icons";

// contexts
import { useUser } from "@/contexts/UserContext";

const defaultCarPatternFormValue = {
  id: undefined,
  name: "",
  car_type: "",
  restriction_ids: [],
  wc_numbers: [
    {
      id: undefined,
      cargo_volume: 0,
      normal_seat: 0,
      wc_seat: 0,
    },
  ],
};

type Props = {
  httpClient: HttpClient;
  router: ReturnType<typeof useRouter>;
  carForm: Car;
  setCarForm: React.Dispatch<React.SetStateAction<Car>>;
  carPatternForm: CarPattern;
  setCarPatternForm: React.Dispatch<React.SetStateAction<CarPattern>>;
  carFormErrorMessages: any;
  submitFunction: () => void;
};

const CarForm = ({
  httpClient,
  router,
  carForm,
  setCarForm,
  carPatternForm,
  setCarPatternForm,
  carFormErrorMessages,
  submitFunction,
}: Props) => {
  const { officeName } = useUser();
  const [carRestrictions, setCarRestrictions] = useState<CarRestriction[]>([]);
  const [carPatterns, setCarPatterns] = useState<CarPattern[]>([]);
  const [pointOptions, setPointOptions] = useState<SelectOption[]>([]);

  useEffect(() => {
    fetchCarRestrictions();
    fetchCarPatterns();
    getCarPointOptions();
  }, []);

  useEffect(() => {
    if (carForm.max_seat && !carPatternForm.id) {
      setCarPatternForm((prev) => ({
        ...prev,
        wc_numbers: prev.wc_numbers.map((wcNumber) =>
          wcNumber.wc_seat === 0
            ? { ...wcNumber, normal_seat: carForm.max_seat }
            : wcNumber,
        ),
      }));
    }
  }, [carForm.max_seat]);

  useEffect(() => {
    if (carPatternForm.id) return;

    const max = Number(carForm.max_wc_seat) || 0;
    const targetLength = max + 1;
    const existing = carPatternForm.wc_numbers || [];

    if (existing.length === targetLength) return;

    setCarPatternForm((prev) => {
      const map = Object.fromEntries(
        (prev.wc_numbers || []).map((item) => [item.wc_seat, item]),
      );

      const newWcNumbers = Array.from({ length: targetLength }, (_, i) => {
        const base = map[i];
        return {
          id: base?.id,
          cargo_volume: base?.cargo_volume ?? 0,
          normal_seat: base?.normal_seat ?? 0,
          wc_seat: i,
        };
      });

      return { ...prev, wc_numbers: newWcNumbers };
    });
  }, [carForm.max_wc_seat]);

  const fetchCarRestrictions = () => {
    const url = "/car_restrictions";
    httpClient.get<ResponseCarRestrictions>(url).then((response) => {
      setCarRestrictions(response.data.car_restrictions);
    });
  };

  const fetchCarPatterns = () => {
    const url = "/car_patterns";
    httpClient.get<ResponseCarPatterns>(url).then((response) => {
      setCarPatterns(response.data.car_patterns);
    });
  };

  const getCarPointOptions = () => {
    const url = "/cars/point_options";
    httpClient.get<ResponseVcPointOptions>(url).then((res) => {
      const options: SelectOption[] = res.data.point_options.map((point) => ({
        label: point.label,
        value: point.value,
      }));
      setPointOptions(options);

      setCarForm((prev) => {
        if (!prev.point_id && options.length > 0) {
          const officePoint = res.data.point_options.find(
            (point) => point.is_office,
          );
          const officePointId: number = officePoint
            ? (officePoint.value as number)
            : (options[0].value as number);

          return {
            ...prev,
            point_id: officePointId,
          };
        }
        return prev;
      });
    });
  };

  const carPatternOptions = () => {
    const options: SelectOption[] = carPatterns.map((carPattern) => {
      return {
        label: carPattern.name as string,
        value: carPattern.id as number,
      };
    });
    options.unshift({ label: "新規作成", value: "" });
    return options;
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setCarPatternForm(
      carPatterns.find(
        (carPattern) =>
          carPattern.id === Number(value) || carPattern.id === undefined,
      ) || defaultCarPatternFormValue,
    );
  };

  const goBack = () => {
    router.push("/cars");
  };

  return (
    <div id="contents">
      <section>
        <div className="headSCT">
          <div className="cont">
            <h1>
              <FontAwesomeIcon icon={faClipboardCheck} />
              {carForm.id ? "車両編集" : "車両登録"}
            </h1>
            <ul className="button">
              <li>
                <Link href="/cars">
                  <FontAwesomeIcon icon={faClipboardList} />
                  車両一覧
                </Link>
              </li>
            </ul>
            {officeName && (
              <div className="officeNameDisplay">{officeName}</div>
            )}
          </div>
        </div>
      </section>

      <section>
        <div className="inputSCT">
          <div className="cont">
            <div className="inputbox">
              <div className="set">
                <div className="head">
                  <h2>
                    <FontAwesomeIcon icon={faShuttleVan} />
                    車両
                  </h2>
                </div>
                <div className="flex">
                  <fieldset className="basic flex">
                    <InputField
                      name="name"
                      label="車両名"
                      type="text"
                      labelClassName="text required"
                      inputClassName="middle"
                      setState={setCarForm}
                      value={carForm.name}
                      errorMessage={carFormErrorMessages["car.name"] ?? ""}
                    />
                    <InputField
                      name="number"
                      label="車両番号"
                      type="text"
                      labelClassName="text required"
                      inputClassName="middle"
                      setState={setCarForm}
                      value={carForm.number}
                      errorMessage={carFormErrorMessages["car.number"] ?? ""}
                    />
                    <InputField
                      name="max_seat"
                      label="定員"
                      type="number"
                      labelClassName="text required"
                      inputClassName="middle"
                      setState={setCarForm}
                      value={carForm.max_seat}
                      errorMessage={carFormErrorMessages["car.max_seat"] ?? ""}
                    />
                    <InputField
                      name="max_wc_seat"
                      label="車椅子数"
                      type="number"
                      labelClassName="text required"
                      inputClassName="middle"
                      setState={setCarForm}
                      value={carForm.max_wc_seat}
                      errorMessage={
                        carFormErrorMessages["car.max_wc_seat"] ?? ""
                      }
                    />
                    <SelectField
                      label="車両の出発・到着地点："
                      options={pointOptions}
                      value={carForm.point_id}
                      name="point_id"
                      setState={setCarForm}
                    />
                  </fieldset>
                </div>
              </div>

              <div className="set">
                <fieldset className="basic flex">
                  <label className="select">
                    <span>車両パターン</span>
                    <select
                      onChange={handleSelectChange}
                      value={carPatternForm.id}
                    >
                      {carPatternOptions().map((option, index) => (
                        <option key={index} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </fieldset>
                <SeatPatternImages
                  carPatternForm={carPatternForm}
                  setCarPatternForm={setCarPatternForm}
                  carRestrictions={carRestrictions}
                  errorMessages={carFormErrorMessages}
                />
              </div>

              {carForm.id && (
                <div className="stop">
                  <h4>停止設定</h4>
                  <CheckboxField
                    label="停止する"
                    checked={carForm.stopped}
                    setState={setCarForm}
                    name="stopped"
                  />
                </div>
              )}

              <div className="submitbox">
                <button
                  type="button"
                  aria-label="戻る"
                  className="sub"
                  onClick={goBack}
                >
                  <FontAwesomeIcon icon={faUndoAlt} />
                  戻る
                </button>
                <button
                  type="button"
                  aria-label="登録"
                  onClick={submitFunction}
                >
                  <FontAwesomeIcon icon={faSave} />
                  登録
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CarForm;
