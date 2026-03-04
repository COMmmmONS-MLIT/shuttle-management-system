import React, { useEffect, useState } from "react";
import AsyncSelect from "react-select/async";
import SetFormData from "./SetFormData";

type Option = {
  label: string;
  value: string | number;
};

type Props = {
  label?: string;
  labelClassName?: string;
  placeholder?: string;
  value?: string | number;
  name?: string;
  index?: number;
  setState: any;
  errorMessage?: string;
  loadOptions: (inputValue: string) => Promise<Option[]>;
  defaultOptions?: Option[];
  isClearable?: boolean;
  isDisabled?: boolean;
};

const AsyncSelectField = ({
  label = "",
  labelClassName = "",
  placeholder = "",
  name = "",
  index = undefined,
  setState,
  value = "",
  errorMessage = "",
  loadOptions,
  defaultOptions = [],
  isClearable = true,
  isDisabled = false,
}: Props) => {
  const [showErrorMessage, setShowErrorMessage] = useState<boolean>(true);
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);

  useEffect(() => {
    setShowErrorMessage(true);
  }, [errorMessage]);

  useEffect(() => {
    if (value) {
      const option = defaultOptions.find((opt) => opt.value === value);
      if (option) {
        setSelectedOption(option);
      } else {
        setSelectedOption({ label: value.toString(), value });
      }
    } else {
      setSelectedOption(null);
    }
  }, [value, defaultOptions]);

  const handleChange = (option: Option | null) => {
    setSelectedOption(option);

    if (option) {
      setShowErrorMessage(false);
      if (name) {
        SetFormData({
          setState,
          name,
          value: option.value,
          index,
        });
      } else {
        setState(option.value);
      }
    } else {
      setShowErrorMessage(true);
      if (name) {
        SetFormData({ setState, name, value: "", index });
      } else {
        setState("");
      }
    }
  };

  return (
    <label className={`${errorMessage ? "w-error" : ""} ${labelClassName}`}>
      <span>{label}</span>
      <AsyncSelect
          value={selectedOption}
          onChange={handleChange}
          loadOptions={loadOptions}
          defaultOptions={defaultOptions}
          placeholder={placeholder}
          isClearable={isClearable}
          isDisabled={isDisabled}
          menuPortalTarget={
            typeof document !== "undefined" ? document.body : undefined
          }
          menuPosition="fixed"
          noOptionsMessage={({ inputValue }) =>
            inputValue ? "該当する利用者が見つかりません" : "名前、カナ、利用者番号を入力してください"
          }
          loadingMessage={() => "検索中..."}
          classNamePrefix="react-select"
          components={{
            DropdownIndicator: () => null,
            LoadingIndicator: () => null,
          }}
          styles={{
            control: (baseStyles) => ({
              ...baseStyles,
              height: "2.8em",
              minHeight: "2.8em",
              minWidth: "200px",
              width: "200px",
              boxSizing: "border-box",
              border: "none",
              boxShadow: "none",
            }),
            valueContainer: (baseStyles) => ({
              ...baseStyles,
              padding: "0 0.8em",
              height: "2.8em",
              alignItems: "center",
            }),
            input: (baseStyles) => ({
              ...baseStyles,
              margin: 0,
              padding: 0,
            }),
            indicatorsContainer: (baseStyles) => ({
              ...baseStyles,
              height: "2.8em",
              alignItems: "center",
              backgroundColor: "#fff",
              borderRadius: "0 3px 3px 0",
            }),
            indicatorSeparator: () => ({
              display: "none",
            }),
            clearIndicator: (baseStyles) => ({
              ...baseStyles,
              color: "#999",
              padding: "0 0.7em",
              cursor: "pointer",
              "&:hover": {
                color: "#666",
              },
              svg: {
                width: "16px",
                height: "16px",
              },
            }),
            loadingIndicator: () => ({
              display: "none",
            }),
            menu: (baseStyles) => ({
              ...baseStyles,
              zIndex: 9999,
            }),
            menuPortal: (baseStyles) => ({
              ...baseStyles,
              zIndex: 9999,
            }),
          }}
        />
      {errorMessage && showErrorMessage && (
        <div>
          <small className={`selectField errorMessage`}>
            {errorMessage}
          </small>
        </div>
      )}
    </label>
  );
};

export default AsyncSelectField;
