import React, { useEffect, useState } from "react";
import InputField from "@/component/FormControls/InputField";
import SelectField from "../FormControls/SelectField";
import CheckboxField from "../FormControls/CheckboxField";
import HttpClient from "@/adapter/HttpClient";
import { ErrorToast } from "@/component/ReactHotToast/ToastMessage";

// types
import { UseCase, Customer } from "@/types/customer";
import { ResponseVcPointOptions } from "@/types/ApiResponse/visiting";

// context
import { useUser } from "@/contexts/UserContext";

type Props = {
  useCaseForm: UseCase[];
  setUseCaseForm: React.Dispatch<React.SetStateAction<UseCase[]>>;
  addressOptions: { label: string; value: string }[];
  customerForm: Customer;
  setCustomerForm: React.Dispatch<React.SetStateAction<Customer>>;
  errorMessages?: any;
};

const UseCaseForm = ({
  useCaseForm,
  setUseCaseForm,
  addressOptions,
  customerForm,
  setCustomerForm,
  errorMessages = {},
}: Props) => {
  const { category } = useUser();
  const [pointOptions, setPointOptions] = useState<
    { label: string; value: number }[]
  >([]);
  const httpClient = new HttpClient();

  useEffect(() => {
    getVcPointOptions();
  }, []);

  // activeがチェックされたタイミングでデフォルト値を反映させる
  const handleActiveChange = (index: number, checked: boolean) => {
    setUseCaseForm((prev) =>
      prev.map((useCase, i) => {
        if (i !== index) return useCase;
        if (checked && !useCase.active) {
          return {
            ...useCase,
            active: true,
            departure_time: customerForm.departure_time,
            pick_up_point_order: customerForm.default_pick_up_point_order,
            start_time: customerForm.start_time,
            arrival_time: customerForm.arrival_time,
            drop_off_point_order: customerForm.default_drop_off_point_order,
            self_pick_up: customerForm.self_pick_up,
            self_drop_off: customerForm.self_drop_off,
          };
        }
        return { ...useCase, active: checked };
      }),
    );
  };

  const getVcPointOptions = () => {
    const url = "/customers/point_options";
    httpClient
      .get<ResponseVcPointOptions>(url)
      .then((res) => {
        setPointOptions(res.data.point_options);
        const officePoint = res.data.point_options.find(
          (point) => point.is_office,
        );
        const officePointId = officePoint
          ? officePoint.value
          : res.data.point_options[0].value;

        setUseCaseForm((prev) =>
          prev.map((useCase) => ({
            ...useCase,
            pick_up_base_point_id:
              useCase.pick_up_base_point_id ?? officePointId,
            drop_off_base_point_id:
              useCase.drop_off_base_point_id ?? officePointId,
          })),
        );
      })
      .catch(() => {
        ErrorToast("地点の取得に失敗しました");
      });
  };

  const dayOfWeekJapanese = (dayOfWeek: string) => {
    switch (dayOfWeek) {
      case "sunday":
        return "日";
      case "monday":
        return "月";
      case "tuesday":
        return "火";
      case "wednesday":
        return "水";
      case "thursday":
        return "木";
      case "friday":
        return "金";
      case "saturday":
        return "土";
      default:
        return "";
    }
  };
  return (
    <div className="set">
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .inputSCT .pattern td {
            padding-left: 0 !important;
          }
        `,
        }}
      />
      <fieldset className="pattern">
        <legend>利用パターン</legend>
        <div className="viewport js-scroll">
          <table>
            <thead>
              <tr>
                <th></th>
                <th className="required">
                  <span>迎え時間</span>
                </th>
                <th>迎え乗車地点</th>
                <th>迎え降車場所</th>
                {category === "welfare" && (
                  <th className="required">
                    <span>開始時間</span>
                  </th>
                )}
                <th className="required">
                  <span>終了時間</span>
                </th>
                <th>送り降車地点</th>
                <th>送り乗車場所</th>
                {/* <th>迎えリクエスト</th>
                <th>送りリクエスト</th> */}
                <th>自来</th>
                <th>自退</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ backgroundColor: "#f5f5dc" }}>
                <td style={{ fontWeight: "bold" }}>デフォルト</td>
                <td>
                  <InputField
                    name="departure_time"
                    type="time"
                    labelClassName="time"
                    inputClassName="short"
                    value={customerForm.departure_time}
                    setState={setCustomerForm}
                    errorMessage={
                      errorMessages["customer.departure_time"] ?? ""
                    }
                  />
                </td>
                <td>
                  <div style={{ display: "flex" }}>
                    <SelectField
                      options={addressOptions}
                      value={customerForm.default_pick_up_point_order}
                      name={"default_pick_up_point_order"}
                      setState={setCustomerForm}
                      errorMessage={
                        errorMessages["customer.default_pick_up_point_id"] ?? ""
                      }
                    />
                  </div>
                </td>
                <td></td>
                {category === "welfare" && (
                  <td>
                    <InputField
                      name="start_time"
                      type="time"
                      labelClassName="time"
                      inputClassName="short"
                      value={customerForm.start_time}
                      setState={setCustomerForm}
                      errorMessage={errorMessages["customer.start_time"] ?? ""}
                    />
                  </td>
                )}
                <td>
                  <InputField
                    name="arrival_time"
                    type="time"
                    labelClassName="time"
                    inputClassName="short"
                    value={customerForm.arrival_time}
                    setState={setCustomerForm}
                    errorMessage={errorMessages["customer.arrival_time"] ?? ""}
                  />
                </td>
                <td>
                  <div style={{ display: "flex" }}>
                    <SelectField
                      options={addressOptions}
                      value={customerForm.default_drop_off_point_order}
                      name={"default_drop_off_point_order"}
                      setState={setCustomerForm}
                      errorMessage={
                        errorMessages["customer.default_drop_off_point_id"] ??
                        ""
                      }
                    />
                  </div>
                </td>
                <td></td>
                <td>
                  <CheckboxField
                    checked={customerForm.self_pick_up}
                    name="self_pick_up"
                    setState={setCustomerForm}
                  />
                </td>
                <td>
                  <CheckboxField
                    checked={customerForm.self_drop_off}
                    name="self_drop_off"
                    setState={setCustomerForm}
                  />
                </td>
              </tr>
              {useCaseForm.map((useCase, key) => (
                <tr key={key}>
                  <td>
                    <label className="checkbox">
                      <input
                        type="checkbox"
                        checked={useCase.active}
                        onChange={(e) =>
                          handleActiveChange(key, e.target.checked)
                        }
                      />
                      <span>{dayOfWeekJapanese(useCase.day_of_week)}</span>
                    </label>
                  </td>
                  <td>
                    <InputField
                      type="time"
                      labelClassName="time"
                      inputClassName="short"
                      value={useCase.departure_time}
                      name={"departure_time"}
                      setState={setUseCaseForm}
                      index={key}
                      errorMessage={
                        errorMessages[`use_cases[${key}].departure_time`] ?? ""
                      }
                    />
                  </td>
                  <td>
                    <div style={{ display: "flex" }}>
                      <SelectField
                        options={addressOptions}
                        value={useCase.pick_up_point_order}
                        name={"pick_up_point_order"}
                        setState={setUseCaseForm}
                        index={key}
                        errorMessage={
                          errorMessages[
                            `use_cases[${key}].pick_up_point_order`
                          ] ?? ""
                        }
                      />
                    </div>
                  </td>
                  <td>
                    <div style={{ display: "flex" }}>
                      <SelectField
                        options={pointOptions}
                        value={useCase.pick_up_base_point_id}
                        name={"pick_up_base_point_id"}
                        setState={setUseCaseForm}
                        index={key}
                      />
                    </div>
                  </td>
                  {category === "welfare" && (
                    <td>
                      <InputField
                        type="time"
                        labelClassName="time"
                        inputClassName="short"
                        value={useCase.start_time}
                        name={"start_time"}
                        setState={setUseCaseForm}
                        index={key}
                        errorMessage={
                          errorMessages[`use_cases[${key}].start_time`] ?? ""
                        }
                      />
                    </td>
                  )}
                  <td>
                    <InputField
                      type="time"
                      labelClassName="time"
                      inputClassName="short"
                      value={useCase.arrival_time}
                      name={"arrival_time"}
                      setState={setUseCaseForm}
                      index={key}
                      errorMessage={
                        errorMessages[`use_cases[${key}].arrival_time`] ?? ""
                      }
                    />
                  </td>
                  <td>
                    <div style={{ display: "flex" }}>
                      <SelectField
                        options={addressOptions}
                        value={useCase.drop_off_point_order}
                        name={"drop_off_point_order"}
                        setState={setUseCaseForm}
                        index={key}
                        errorMessage={
                          errorMessages[
                            `use_cases[${key}].drop_off_point_order`
                          ] ?? ""
                        }
                      />
                    </div>
                  </td>
                  <td>
                    <div style={{ display: "flex" }}>
                      <SelectField
                        options={pointOptions}
                        value={useCase.drop_off_base_point_id}
                        name={"drop_off_base_point_id"}
                        setState={setUseCaseForm}
                        index={key}
                      />
                    </div>
                  </td>
                  <td>
                    <CheckboxField
                      checked={useCase.self_pick_up}
                      name={"self_pick_up"}
                      setState={setUseCaseForm}
                      index={key}
                    />
                  </td>
                  <td>
                    <CheckboxField
                      checked={useCase.self_drop_off}
                      name={"self_drop_off"}
                      setState={setUseCaseForm}
                      index={key}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </fieldset>
    </div>
  );
};

export default UseCaseForm;
