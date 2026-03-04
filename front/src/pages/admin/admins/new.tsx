import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import InputField from "@/component/FormControls/InputField";
import HttpClient from "@/adapter/HttpClient";
import {
  SuccessToast,
  ErrorToast,
} from "@/component/ReactHotToast/ToastMessage";

// types
import SuccessResponse from "@/types/ApiResponse/success";
// font awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClipboardList,
  faNotesMedical,
  faUser,
  faSave,
} from "@fortawesome/free-solid-svg-icons";

const defaultFormValue = {
  email: "",
  password: "",
};

const NewAdminAccountPage = () => {
  const httpClient = new HttpClient();
  const router = useRouter();
  const [form, setForm] = useState(defaultFormValue);
  const [showPass, setShowPass] = useState<boolean>(false);

  const submit = () => {
    httpClient
      .post<SuccessResponse>("/admin/admins", { admin: form })
      .then((response) => {
        SuccessToast(response.data.messages);
        router.push("/admin/admins");
      })
      .catch((error) => {
        ErrorToast(error.response?.data?.messages ?? ["エラーが発生しました"]);
      });
  };

  return (
    <div id="contents">
      <section>
        <div className="headSCT">
          <div className="cont">
            <h1>
              <FontAwesomeIcon icon={faNotesMedical} />
              管理者アカウント登録
            </h1>
            <ul className="button">
              <li>
                <Link href="/admin/admins">
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
                    name="email"
                    label="E-mail"
                    labelClassName="text"
                    type="email"
                    inputClassName="long"
                    value={form.email}
                    setState={setForm}
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
                    value={form.password}
                    setState={setForm}
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
                <button type="button" aria-label="登録" onClick={submit}>
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

export default NewAdminAccountPage;
