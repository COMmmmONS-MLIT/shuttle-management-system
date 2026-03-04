import React, { useState } from "react";
import HttpClient from "@/adapter/HttpClient";
import InputField from "@/component/FormControls/InputField";
import {
  SuccessToast,
  ErrorToast,
} from "@/component/ReactHotToast/ToastMessage";

import { User } from "@/types/user";
import SuccessResponse from "@/types/ApiResponse/success";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faKey, faSave } from "@fortawesome/free-solid-svg-icons";

type Props = {
  account: User;
  officeId: string;
  onClose: () => void;
  onSuccess?: () => void;
};

const PasswordResetModal = ({
  account,
  officeId,
  onClose,
  onSuccess,
}: Props) => {
  const httpClient = new HttpClient();
  const [form, setForm] = useState({
    password: "",
    password_confirmation: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [errorMessages, setErrorMessages] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = () => {
    setErrorMessages({});
    if (!form.password.trim()) {
      setErrorMessages((prev) => ({
        ...prev,
        password: "新しいパスワードを入力してください",
      }));
      return;
    }
    if (form.password.length < 6) {
      setErrorMessages((prev) => ({
        ...prev,
        password: "パスワードは6文字以上で入力してください",
      }));
      return;
    }
    if (form.password !== form.password_confirmation) {
      setErrorMessages((prev) => ({
        ...prev,
        password_confirmation: "パスワードが一致しません",
      }));
      return;
    }

    setSubmitting(true);
    const path = `/admin/offices/${officeId}/users/${account.id}/password`;
    const params = {
      user: {
        password: form.password,
        password_confirmation: form.password_confirmation,
      },
    };

    httpClient
      .put<SuccessResponse>(path, params)
      .then((response) => {
        SuccessToast(response.data.messages);
        onClose();
        onSuccess?.();
      })
      .catch((error) => {
        ErrorToast(error.response.data.messages);
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  const handleClose = () => {
    if (submitting) return;
    setForm({ password: "", password_confirmation: "" });
    setErrorMessages({});
    onClose();
  };

  return (
    <section>
      <div className="modalSCT active passwordResetModal">
        <div className="mask" onClick={handleClose}></div>
        <div className="cont">
          <div className="close" onClick={handleClose}></div>
          <div className="inner wide USERS">
            <div className="sortSCT">
              <div className="head">
                <h2>
                  <FontAwesomeIcon icon={faKey} />
                  パスワード再設定
                </h2>
              </div>
              <div className="sort">
                <div className="searchbox">
                  <fieldset className="pass flex">
                    <InputField
                      name="password"
                      label="新しいパスワード"
                      type={showPass ? "text" : "password"}
                      labelClassName="password"
                      inputClassName="middel"
                      value={form.password}
                      setState={setForm}
                      errorMessage={errorMessages["password"] ?? ""}
                    />
                    <InputField
                      name="password_confirmation"
                      label="新しいパスワード（確認）"
                      type={showPass ? "text" : "password"}
                      labelClassName="password"
                      inputClassName="middel"
                      value={form.password_confirmation}
                      setState={setForm}
                      errorMessage={
                        errorMessages["password_confirmation"] ?? ""
                      }
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
              </div>
              <div className="submitbox">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  aria-label="更新"
                >
                  <FontAwesomeIcon icon={faSave} />
                  更新
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PasswordResetModal;
