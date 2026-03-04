import React, { useEffect, useState } from "react";
import SetFormData from "./SetFormData";

type Props = {
  label?: string;
  type: string;
  labelClassName?: string;
  inputClassName?: string;
  placeholder?: string;
  unitText?: string;
  value?: string | number;
  name?: string;
  index?: number;
  setState: any;
  readOnly?: boolean;
  errorMessage?: string;
};

const InputField = ({
  label = "",
  type,
  labelClassName = "",
  inputClassName = "",
  placeholder = "",
  unitText = "",
  name = "",
  index = undefined,
  setState,
  value = "",
  readOnly = false,
  errorMessage = "",
}: Props) => {
  const [showErrorMessage, setShowErrorMessage] = useState<boolean>(true);

  useEffect(() => {
    setShowErrorMessage(true);
  }, [errorMessage]);

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.length > 0) {
      setShowErrorMessage(false);
    } else {
      setShowErrorMessage(true);
    }

    if (name) {
      SetFormData({ setState, name, value: e.target.value, index });
    } else {
      setState(e.target.value);
    }
  };

  return (
    <>
      <label className={labelClassName}>
        <span>{label}</span>
        <span>
          <div>
            <input
              type={type}
              className={`${inputClassName} ${
                errorMessage && showErrorMessage ? "error" : ""
              }`}
              placeholder={placeholder}
              onChange={handleValueChange}
              value={value}
              readOnly={readOnly}
            />
            {unitText}
          </div>
          {errorMessage && showErrorMessage && (
            <div>
              <small className={`errorMessage inputField ${inputClassName}`}>
                {errorMessage}
              </small>
            </div>
          )}
        </span>
      </label>
    </>
  );
};

export default InputField;
