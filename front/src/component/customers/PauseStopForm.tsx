import React from "react";
import InputField from "@/component/FormControls/InputField";

//types
import { Customer } from "@/types/customer";

type Props = {
  customerForm: Customer;
  setCustomerForm: React.Dispatch<React.SetStateAction<Customer>>;
};

const PauseStopForm = ({ customerForm, setCustomerForm }: Props) => {
  return (
    <>
      <div className="pause">
        <h4>休止設定</h4>
        <InputField
          label="休止日"
          type="date"
          labelClassName="date"
          name="stopped_at"
          value={customerForm.stopped_at}
          setState={setCustomerForm}
        />

        <InputField
          label="休止理由"
          type="text"
          labelClassName="text"
          inputClassName="middle"
          name="stopped_reason"
          value={customerForm.stopped_reason}
          setState={setCustomerForm}
        />
      </div>
    </>
  );
};

export default PauseStopForm;
