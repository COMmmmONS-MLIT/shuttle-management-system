import React from "react";
import InputField from "../FormControls/InputField";

// types
import { CarPattern } from "@/types/carPattern";
import { CarRestriction } from "@/types/carRestriction";

// font awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";

type Prop = {
  carPatternForm: CarPattern;
  setCarPatternForm: React.Dispatch<React.SetStateAction<CarPattern>>;
  carRestrictions: CarRestriction[];
  errorMessages?: any;
};

const SeatPatternImages = ({
  carPatternForm,
  setCarPatternForm,
  carRestrictions,
  errorMessages = {},
}: Prop) => {
  const onCheckedCarRestriction = (id: number) => {
    setCarPatternForm((prev) => {
      const currentIds = prev.restriction_ids || [];

      const updatedIds = currentIds.includes(id)
        ? currentIds.filter((item) => item !== id)
        : [...currentIds, id];

      return {
        ...prev,
        restriction_ids: updatedIds,
      };
    });
  };

  return (
    <>
      <div>
        <fieldset className="sheet">
          <legend>車両パターン（{carPatternForm.name || "新規作成"}）</legend>
        </fieldset>
      </div>
      <div className="inputbox" style={{ marginBottom: "10px" }}>
        <div style={{ marginBottom: "10px", marginLeft: "6px" }}>
          <InputField
            label="車種"
            type="text"
            labelClassName="text required"
            name="name"
            readOnly={Boolean(carPatternForm.id)}
            value={carPatternForm.name}
            setState={setCarPatternForm}
            errorMessage={errorMessages["car.pattern_name"] ?? ""}
          />
        </div>

        {carPatternForm.wc_numbers.map((wcNumber, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              marginBottom: 15,
              marginLeft: 6,
            }}
          >
            <label className="text" style={{ marginBottom: 0 }}>
              <span>通常座席数(車椅子{wcNumber.wc_seat}台の場合)</span>
              <input
                type="number"
                className="short"
                onChange={(e) => {
                  setCarPatternForm((prev) => {
                    const updatedWcNumbers = [...prev.wc_numbers];
                    updatedWcNumbers[i] = {
                      ...updatedWcNumbers[i],
                      normal_seat: Number(e.target.value),
                    };
                    return {
                      ...prev,
                      wc_numbers: updatedWcNumbers,
                    };
                  });
                }}
                value={wcNumber.normal_seat}
              />
            </label>
            <label className="text" style={{ marginBottom: 0 }}>
              <span>積載可能量</span>
              <input
                type="number"
                className="short"
                onChange={(e) => {
                  setCarPatternForm((prev) => {
                    const updatedWcNumbers = [...prev.wc_numbers];
                    updatedWcNumbers[i] = {
                      ...updatedWcNumbers[i],
                      cargo_volume: Number(e.target.value),
                    };
                    return {
                      ...prev,
                      wc_numbers: updatedWcNumbers,
                    };
                  });
                }}
                value={wcNumber.cargo_volume}
              />
            </label>
            {i === carPatternForm.wc_numbers.length - 1 &&
              carPatternForm.wc_numbers.length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    setCarPatternForm((prev) => ({
                      ...prev,
                      wc_numbers: prev.wc_numbers?.slice(0, -1),
                    }));
                  }}
                  style={{
                    background: "white",
                    cursor: "pointer",
                    padding: 0,
                  }}
                  aria-label="車椅子座席を削除"
                >
                  <FontAwesomeIcon
                    icon={faTrash}
                    size="lg"
                    style={{ color: "red" }}
                  />
                </button>
              )}
          </div>
        ))}

        {errorMessages["car.wc_numbers"] && (
          <div className="w-100">
            <small className="errorMessage wc-numbers">
              {errorMessages["car.wc_numbers"]}
            </small>
          </div>
        )}

        <button
          type="button"
          className="subsub js-addbutton"
          style={{ marginBottom: "16px" }}
          onClick={() => {
            setCarPatternForm((prev) => ({
              ...prev,
              wc_numbers: [
                ...prev.wc_numbers,
                {
                  id: 0,
                  cargo_volume: 0,
                  normal_seat: 0,
                  wc_seat: prev.wc_numbers?.length || 0,
                },
              ],
            }));
          }}
        >
          <FontAwesomeIcon icon={faPlus} />
          車椅子座席を追加する
        </button>
        <div className="spacer"></div>

        <legend className="required">
          <span>車両制限</span>
        </legend>
        {carRestrictions.map((carRestriction, i) => (
          <label key={i} className="checkbox">
            <input
              type="checkbox"
              onChange={() => onCheckedCarRestriction(carRestriction.id)}
              checked={carPatternForm.restriction_ids?.includes(
                carRestriction.id,
              )}
            />
            <span>{carRestriction.name}</span>
          </label>
        ))}
        {errorMessages["car.restriction_ids"] && (
          <div className="w-100">
            <small className="errorMessage checkBoxGroupVertical">
              {errorMessages["car.restriction_ids"]}
            </small>
          </div>
        )}
      </div>
    </>
  );
};

export default SeatPatternImages;
