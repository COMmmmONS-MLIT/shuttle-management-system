import React from "react";
import TextareaField from "@/component/FormControls/TextareaField";

// types
import { Customer } from "@/types/customer";

type Props = {
  customerForm: Customer;
  setCustomerForm: React.Dispatch<React.SetStateAction<Customer>>;
};

const OptionsForm = ({ customerForm, setCustomerForm }: Props) => {
  return (
    <div className="set flex js-point">
      <fieldset className="notes">
        <legend>注意事項</legend>
        <TextareaField
          label="共通事項"
          labelClassName="textarea"
          placeholder="例：転倒注意！"
          name="common_note"
          value={customerForm.common_note}
          setState={setCustomerForm}
        />
        <TextareaField
          label="迎え申送り（50字）"
          labelClassName="textarea"
          name="pick_up_note"
          value={customerForm.pick_up_note}
          setState={setCustomerForm}
        />
        <TextareaField
          label="送り申送り（50字）"
          labelClassName="textarea"
          name="drop_off_note"
          value={customerForm.drop_off_note}
          setState={setCustomerForm}
        />
      </fieldset>
    </div>
  );
};

export default OptionsForm;
