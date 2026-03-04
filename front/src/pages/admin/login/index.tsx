import React, { useState } from "react";
import InputField from "@/component/FormControls/InputField";

// font awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignInAlt } from "@fortawesome/free-solid-svg-icons";

// contexts
import { useUser } from "@/contexts/UserContext";

const LoginPage = () => {
  const { signIn } = useUser();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);

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
                共同送迎管理システム
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
              {/* <ul>
                <li><a href="#">パスワードを忘れた方</a></li>
              </ul> */}
              <div className="submitbox">
                <button
                  type="button"
                  aria-label="ログイン"
                  onClick={() => signIn(email, password)}
                >
                  <FontAwesomeIcon icon={faSignInAlt} />
                  ログイン
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

export default LoginPage;
