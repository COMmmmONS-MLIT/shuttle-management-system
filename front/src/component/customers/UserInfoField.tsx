import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";

type Props = {
  user: { email: string };
};

const UserInfoField = ({ user }: Props) => {
  return (
    <div className="set flex">
      <div className="head">
        <h2>
          <FontAwesomeIcon icon={faUser} />
          ユーザー
        </h2>
      </div>
      <fieldset className="basic flex">
        <label className="text">
          <span>メールアドレス</span>
          <span>
            <div>
              {user.email}
            </div>
          </span>
        </label>
      </fieldset>
    </div>
  );
};

export default UserInfoField;

