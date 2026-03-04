import React, { useEffect, useState } from "react";
import SetFormData from "./SetFormData";

type Props = {
  label?: string;
  inputName: string;
  name?: string;
  index?: number;
  value: any;
  setState: any;
  options: { label: string; value: any }[];
  disabled?: boolean;
  errorMessage?: string;
};

const RadioField = ({
  label = "",
  inputName,
  name = "",
  index = undefined,
  value,
  setState,
  options,
  disabled = false,
  errorMessage = '',
}: Props) => {
  const [showErrorMessage, setShowErrorMessage] = useState<boolean>(true);

  useEffect(() => {
    setShowErrorMessage(true);
  }, [errorMessage]);

  const handleValueChange = (value: string) => {
    if (value.length > 0) {
      setShowErrorMessage(false);
    } else {
      setShowErrorMessage(true);
    }

    if (name) {
      SetFormData({ setState, name, value, index });
    } else {
      setState(value);
    }
  };
  return (
    <>
      <span>{label}</span>
      <div className="w-100">
        {options.map((option, index) => (
          <label className="radio" key={index}>
            <input
              type="radio"
              name={inputName}
              checked={String(value) === String(option.value)}
              value={option.value}
              onChange={() => handleValueChange(option.value)}
              disabled={disabled}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
      {errorMessage && showErrorMessage && (
        <div>
          <small className="radioField errorMessage">{errorMessage}</small>
        </div>
      )}
    </>
  );
};

export default RadioField;
