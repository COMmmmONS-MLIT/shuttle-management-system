import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import InputField from "@/component/FormControls/InputField";
import HttpClient from "@/adapter/HttpClient";
import {
  SuccessToast,
  ErrorToast,
} from "@/component/ReactHotToast/ToastMessage";

// types
import SuccessResponse from "@/types/ApiResponse/success";
import InstallStatusResponse from "@/types/ApiResponse/install";

// font awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserPlus } from "@fortawesome/free-solid-svg-icons";

const InstallPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [checking, setChecking] = useState<boolean>(true);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  useEffect(() => {
    const httpClient = new HttpClient();
    httpClient
      .get<InstallStatusResponse>("/install", { skipLoading: true })
      .then((response) => {
        if (response.data.admin_exists) {
          router.replace("/admin/login");
        } else {
          setShowForm(true);
        }
      })
      .catch(() => {
        setShowForm(false);
      })
      .finally(() => {
        setChecking(false);
      });
  }, [router]);

  const submit = () => {
    const httpClient = new HttpClient();
    httpClient
      .post<SuccessResponse>("/install", { admin: { email, password } })
      .then((response) => {
        SuccessToast(response.data.messages);
        router.push("/admin/login");
      })
      .catch((error) => {
        const errorMessages = error.response?.data?.full_messages || ["保存に失敗しました"];
        ErrorToast(errorMessages);
      });
  };

  if (checking) {
    return (
      <div className="loginSCT no-before">
        <div className="loader-element">
          <div className="loader" />
        </div>
      </div>
    );
  }

  if (!showForm) {
    return null;
  }

  return (
    <div className="loginSCT no-before">
      <div className="head">
        <a
          href="https://social-mover.co/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src="/img/logo_yoko-e1688471468114.png"
            alt="ソーシャルムーバー株式会社"
          />
          <b>管理者画面</b>
        </a>
      </div>
      <div className="cont">
        <div className="inputSCT">
          <div className="inputbox">
            <div className="set">
              <h1 style={{ fontSize: "20px", textAlign: "center", margin: "20px 0" }}>
                共同送迎管理システム - 初期設定
              </h1>
              <fieldset className="login">
                <label className="email">
                  <span>メールアドレス</span>
                  <InputField
                    type="email"
                    inputClassName="long"
                    setState={setEmail}
                    value={email}
                  />
                </label>
                <label className="password">
                  <span>パスワード</span>
                  <InputField
                    type={showPassword ? "text" : "password"}
                    inputClassName="long"
                    setState={setPassword}
                    value={password}
                  />
                  <label className="checkbox">
                    <input
                      type="checkbox"
                      checked={showPassword}
                      onChange={() => setShowPassword((prev) => !prev)}
                      />
                      <span>表示</span>
                  </label>
                </label>
              </fieldset>
              <div className="submitbox">
                <button
                  type="button"
                  aria-label="登録"
                  onClick={submit}
                >
                  <FontAwesomeIcon icon={faUserPlus} />
                  登録
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <p className="copyright">Copyright©2026 by MLIT. All Rights Reserved.</p>
    </div>
  );
};

export default InstallPage;
