import React from "react";
import SetFormData from "./SetFormData";

type Props = {
  label?: string;
  labelClassName?: string;
  placeholder?: string;
  name?: string;
  index?: number;
  value?: string;
  setState: any;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: React.CSSProperties;
};

const TextareaField = ({
  label = "",
  labelClassName = "",
  placeholder = "",
  name = "",
  index = undefined,
  value = "",
  setState,
  disabled = false,
  fullWidth = false,
  style,
}: Props) => {
  const handleValueChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (name) {
      SetFormData({ setState, name, value: e.target.value, index });
    } else {
      setState(value);
    }
  };
  return (
    <label
      className={labelClassName}
      style={{ width: fullWidth ? "100%" : "auto" }}
    >
      <span>{label}</span>
      <textarea
        value={value}
        placeholder={placeholder}
        onChange={handleValueChange}
        disabled={disabled}
        style={style}
      ></textarea>
    </label>
  );
};

export default TextareaField;
