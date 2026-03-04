import { useState } from "react";
import Link from "next/link";
import InputField from "@/component/FormControls/InputField";
import SelectField from "@/component/FormControls/SelectField";
import HttpClient from "@/adapter/HttpClient";
import { useRouter } from "next/router";
import {
  SuccessToast,
  ErrorToast,
} from "@/component/ReactHotToast/ToastMessage";

// types
import { UserForm } from "@/types/user";
import SuccessResponse from "@/types/ApiResponse/success";
// font awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClipboardList,
  faNotesMedical,
  faUser,
  faSave,
} from "@fortawesome/free-solid-svg-icons";

const defaultAccountFormValue = {
  id: "",
  name: "",
  kana: "",
  email: "",
  role: "staff",
  password: "",
};

const ROLE_OPTIONS = [
  { label: "一般", value: "staff" },
  { label: "管理者", value: "staff_admin" },
];

const NewAccountsPage = () => {
  const httpClient = new HttpClient();
  const router = useRouter();
  const id = router.query.id as string;

  const [accountForm, setAccountForm] = useState<UserForm>(
    defaultAccountFormValue
  );
  const [showPass, setShowPass] = useState<boolean>(false);

  const submitUser = () => {
    const path = `/admin/offices/${id}/users`;
    const params = {
      user: accountForm,
    };
    httpClient
      .post<SuccessResponse>(path, params)
      .then((response) => {
        router.push(`/admin/offices/${id}/accounts`);
        SuccessToast(response.data.messages);
      })
      .catch((error) => {
        ErrorToast(error.response.data.messages);
      });
  };
  return (
    <div id="contents">
      <section>
        <div className="headSCT">
          <div className="cont">
            <h1>
              <FontAwesomeIcon icon={faNotesMedical} />
              アカウント登録
            </h1>
            <ul className="button">
              <li>
                <Link href={`/admin/offices/${id}/accounts`}>
                  <FontAwesomeIcon icon={faClipboardList} />
                  アカウント一覧
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section>
        <div className="inputSCT">
          <div className="cont">
            <div className="inputbox">
              <div className="set">
                <div className="head">
                  <h2>
                    <FontAwesomeIcon icon={faUser} />
                    アカウント
                  </h2>
                </div>
                <fieldset className="basic flex">
                  <InputField
                    name="name"
                    label="アカウント名"
                    labelClassName="text"
                    type="text"
                    inputClassName="middle"
                    value={accountForm.name}
                    setState={setAccountForm}
                  />
                  <InputField
                    name="kana"
                    label="アカウント名（カナ）"
                    labelClassName="text"
                    type="text"
                    inputClassName="middle"
                    value={accountForm.kana}
                    setState={setAccountForm}
                  />
                  <InputField
                    name="email"
                    label="E-mail"
                    labelClassName="text"
                    type="text"
                    inputClassName="long"
                    value={accountForm.email}
                    setState={setAccountForm}
                  />
                  <SelectField
                    name="role"
                    label="権限"
                    options={ROLE_OPTIONS}
                    value={accountForm.role}
                    setState={setAccountForm}
                  />
                </fieldset>
              </div>

              <div className="set">
                <fieldset className="pass flex">
                  <InputField
                    name="password"
                    label="パスワード"
                    type={showPass ? "text" : "password"}
                    labelClassName="password"
                    inputClassName="middel"
                    value={accountForm.password}
                    setState={setAccountForm}
                  />
                  <label className="checkbox">
                    <input
                      type="checkbox"
                      checked={showPass}
                      onChange={() => setShowPass((prev) => !prev)}
                    />
                    <span>表示する</span>
                  </label>
                </fieldset>
              </div>

              <div className="submitbox">
                <button type="button" aria-label="登録" onClick={submitUser}>
                  <FontAwesomeIcon icon={faSave} />
                  登録
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default NewAccountsPage;
