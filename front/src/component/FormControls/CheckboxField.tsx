import React from "react";
import SetFormData from "./SetFormData";

type Props = {
  label?: string;
  checked: boolean;
  trueValue?: string | boolean;
  falseValue?: string | boolean | null;
  name?: string;
  index?: number;
  setState: any;
};

const CheckboxField = ({
  label = "",
  checked,
  trueValue = true,
  falseValue = false,
  name = undefined,
  index = undefined,
  setState,
}: Props) => {
  const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setData(trueValue);
    } else {
      setData(falseValue);
    }
  };

  const setData = (value: string | boolean | null) => {
    if (name && index === undefined) {
      setState((prev: any) => ({ ...prev, [name]: value }));
    } else if (name && index !== undefined) {
      SetFormData({ setState, name, value, index });
    } else {
      if (index === undefined) {
        setState(value);
      } else {
        setState((prev: any) => {
          const data = [...prev];
          data[index] = value;
          return data;
        });
      }
    }
  };
  return (
    <>
      <label className="checkbox">
        <input type="checkbox" onChange={handleCheckbox} checked={checked} />
        <span>{label}</span>
      </label>
    </>
  );
};

export default CheckboxField;
