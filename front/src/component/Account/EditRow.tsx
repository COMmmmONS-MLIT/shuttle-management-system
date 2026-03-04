import React from "react";
import SelectField from "../FormControls/SelectField";
import HttpClient from "@/adapter/HttpClient";
import {
  SuccessToast,
  ErrorToast,
} from "@/component/ReactHotToast/ToastMessage";

// type
import { User } from "@/types/user";
import SuccessResponse from "@/types/ApiResponse/success";
type Props = {
  account: User;
  index: number;
  id: string;
  switchMode: (index: number, value: boolean) => void;
  setAccounts: React.Dispatch<React.SetStateAction<User[]>>;
  fetchUsers: () => void;
};

const accountStatusOptions = [
  { label: "稼働中", value: "true" },
  { label: "停止中", value: "false" },
];

const roleOptions = [
  { label: "一般", value: "staff" },
  { label: "管理者", value: "staff_admin" },
];

const EditRow = ({
  account,
  index,
  switchMode,
  id,
  setAccounts,
  fetchUsers,
}: Props) => {
  const httpClient = new HttpClient();

  const updateAccount = () => {
    const path = `/admin/offices/${id}/users/${account.id}`;
    const params = {
      user: {
        is_active: account.is_active,
        role: account.role,
      },
    };
    httpClient
      .put<SuccessResponse>(path, params)
      .then((response) => {
        switchMode(index, false);
        SuccessToast(response.data.messages);
        fetchUsers();
      })
      .catch((error) => {
        ErrorToast(error.response.data.messages);
      });
  };

  return (
    <tr key={index}>
      <td>{account.id}</td>
      <td>{account.name}</td>
      <td>{account.email}</td>
      <td>
        <fieldset className="start">
          <label className="time js-input">
            <SelectField
              options={accountStatusOptions}
              value={account.is_active ? "true" : "false"}
              setState={setAccounts}
              name="is_active"
              index={index}
              isTableField={true}
            />
          </label>
        </fieldset>
      </td>
      <td>
        <fieldset className="start">
          <label className="time js-input">
            <SelectField
              options={roleOptions}
              value={account.role}
              setState={setAccounts}
              name="role"
              index={index}
              isTableField={true}
            />
          </label>
        </fieldset>
      </td>

      <td className="process">
        <span className="process-cell-inner">
          <a
            className="save js-edit"
            onClick={() => {
              updateAccount();
            }}
          >
            保存
          </a>
        </span>
      </td>
    </tr>
  );
};

export default EditRow;
