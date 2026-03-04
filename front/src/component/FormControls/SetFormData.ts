type Props = {
  value: string | number | boolean | null;
  name: string;
  index: number | undefined;
  setState: any;
};

const SetFormData = ({ setState, name, value, index }: Props) => {
  // is_activeフィールドの場合、文字列の"true"/"false"をbooleanに変換
  let convertedValue = value;
  if (name === "is_active" && typeof value === "string") {
    convertedValue = value === "true";
  }

  if (index === undefined) {
    setState((prev: any) => ({
      ...prev,
      [name]: convertedValue,
    }));
  } else {
    setState((prev: any) => {
      const data = [...prev];
      const targetData = { ...data[index], [name]: convertedValue };
      data[index] = targetData;
      return data;
    });
  }
};

export default SetFormData;
