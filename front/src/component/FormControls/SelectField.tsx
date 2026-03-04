import React, { ChangeEvent, useEffect, useState } from "react";
import SetFormData from "./SetFormData";

type Props = {
  label?: string;
  options: { label: string; value: string | number }[];
  value?: string | number;
  name?: string;
  index?: number;
  setState: any;
  disabled?: boolean;
  errorMessage?: string;
  style?: React.CSSProperties;
  isTableField?: boolean;
};
const SelectField = ({
  label = "",
  options,
  value = "",
  name = "",
  index = undefined,
  setState,
  disabled = false,
  errorMessage = "",
  style = {},
  isTableField = false,
}: Props) => {
  const [showErrorMessage, setShowErrorMessage] = useState<boolean>(true);

  useEffect(() => {
    setShowErrorMessage(true);
  }, [errorMessage]);

  const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedValue: string = e.target.value;

    if (selectedValue.length > 0) {
      setShowErrorMessage(false);
    } else {
      setShowErrorMessage(true);
    }

    const parsedValue = isNaN(parseFloat(selectedValue))
      ? selectedValue
      : parseFloat(selectedValue);
    if (name) {
      SetFormData({ setState, name, value: parsedValue, index });
    } else {
      setState(parsedValue);
    }
  };
  return (
    <>
      <label
        className={`select ${errorMessage ? "w-error" : ""} ${isTableField ? "table-field" : ""}`}
      >
        <span style={{ marginRight: "13px", whiteSpace: "nowrap" }}>
          {label}
        </span>
        <span>
          <div>
            <select
              onChange={handleSelectChange}
              value={value}
              disabled={disabled}
              className={`${errorMessage && showErrorMessage ? "error" : ""}`}
              style={style}
            >
              {options.map((option, index) => (
                <option key={index} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          {errorMessage && showErrorMessage && (
            <div>
              <small className={`selectField errorMessage`}>
                {errorMessage}
              </small>
            </div>
          )}
        </span>
      </label>
    </>
  );
};

export default SelectField;
