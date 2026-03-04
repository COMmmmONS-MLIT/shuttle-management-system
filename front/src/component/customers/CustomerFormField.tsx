import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import InputField from "@/component/FormControls/InputField";
import SelectField from "@/component/FormControls/SelectField";
import TextareaField from "../FormControls/TextareaField";
import ImageField from "@/component/FormControls/ImageField";
import HttpClient from "@/adapter/HttpClient";
import {
  SuccessToast,
  ErrorToast,
} from "@/component/ReactHotToast/ToastMessage";
import { ApiErrorHandler } from "@/services/apiErrorHandler";

// font awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faSave } from "@fortawesome/free-solid-svg-icons";

// types
import { Customer } from "@/types/customer";
import SuccessResponse from "@/types/ApiResponse/success";

// context
import { useUser } from "@/contexts/UserContext";

const contractOptions = [
  { label: "契約", value: 1 },
  { label: "体験", value: 2 },
  { label: "停止", value: 3 },
];

const wHOptions = [
  { label: "あり", value: 1 },
  { label: "なし", value: 0 },
];

const walkerOptions = [
  { label: "なし", value: 0 },
  { label: "あり", value: 1 },
];

const walkingAidSizeOptions = [
  { label: "なし", value: 0 },
  { label: "小(0.3)", value: 0.3 },
  { label: "中(0.5)", value: 0.5 },
  { label: "大(0.7)", value: 0.7 },
  { label: "特大(1.0)", value: 1.0 },
];

const tenjoOptions = [
  { label: "あり", value: 1 },
  { label: "なし", value: 0 },
];

type Props = {
  customerForm: Customer;
  setCustomerForm: React.Dispatch<React.SetStateAction<Customer>>;
  carRestrictionsOptions: { label: string; value: number }[];
  id?: string;
  errorMessages?: any;
  user?: { email: string };
};

const CustomerFormField = ({
  customerForm,
  setCustomerForm,
  carRestrictionsOptions,
  id = "",
  errorMessages = {},
  user,
}: Props) => {
  const { category } = useUser();
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [userForm, setUserForm] = useState({
    email_or_id: "",
    password: "",
  });
  const [userFormErrorMessages, setUserFormErrorMessages] = useState<any>({});
  const httpClient = new HttpClient();

  useEffect(() => {
    setCustomerForm((prev) => ({
      ...prev,
      contract_status: prev.contract_status ?? contractOptions[0].value,
      wc: prev.wc ?? wHOptions[0].value,
      walker: prev.walker ?? walkerOptions[0].value,
      walker_size: prev.walker_size ?? walkingAidSizeOptions[0].value,
      need_helper: prev.need_helper ?? tenjoOptions[0].value,
    }));
  }, [carRestrictionsOptions]);

  const handleUserRegister = () => {
    // バリデーション
    if (!userForm.email_or_id.trim()) {
      ErrorToast("メールアドレスまたはIDを入力してください");
      return;
    }
    if (!userForm.password.trim()) {
      ErrorToast("パスワードを入力してください");
      return;
    }

    // customer_idの取得（idプロパティまたはcustomerForm.id）
    const customerId = id ? Number(id) : customerForm.id;
    if (!customerId) {
      ErrorToast("利用者番号が取得できませんでした");
      return;
    }

    // 入力値が数字のみかどうかをチェック
    const isNumeric = /^\d+$/.test(userForm.email_or_id.trim());
    const params: any = {
      customer_id: customerId,
      password: userForm.password,
    };

    // 数字のみの場合はuser_id、そうでなければemail
    if (isNumeric) {
      params.user_id = userForm.email_or_id.trim();
    } else {
      params.email = userForm.email_or_id.trim();
    }

    const url = "/users";

    httpClient
      .post<SuccessResponse>(url, params)
      .then((res) => {
        SuccessToast(res.data.messages || "ユーザー登録が完了しました");
        setModalOpen(false);
        setUserForm({ email_or_id: "", password: "" });
        setUserFormErrorMessages({});
        // 表示を更新するためにページを再読み込み
        router.reload();
      })
      .catch((error) => {
        const errorMessages = new ApiErrorHandler(error).getErrorMessages();
        setUserFormErrorMessages(errorMessages);
        const errorMessagesArray = error.response?.data?.full_messages || [
          "ユーザー登録に失敗しました",
        ];
        ErrorToast(errorMessagesArray);
      });
  };

  return (
    <>
      <div className="set flex">
        <div className="head">
          <h2>
            <FontAwesomeIcon icon={faUser} />
            利用者
          </h2>
          {!user && (
            <button
              type="button"
              onClick={() => setModalOpen(true)}
            >
              <FontAwesomeIcon icon={faUser} />
              ユーザー登録
            </button>
          )}
        </div>
      <fieldset className="basic flex">
        <InputField
          name="cd"
          label="利用者番号"
          type="text"
          labelClassName="text required"
          inputClassName="short"
          value={customerForm.cd}
          setState={setCustomerForm}
          readOnly={!!id}
          errorMessage={errorMessages["customer.cd"] ?? ""}
        />
        <InputField
          name="name"
          label="利用者名"
          type="text"
          labelClassName="text required"
          inputClassName="middle"
          value={customerForm.name}
          setState={setCustomerForm}
          errorMessage={errorMessages["customer.name"] ?? ""}
        />
        <InputField
          name="name_kana"
          label="利用者名（カナ）"
          type="text"
          labelClassName="text required"
          inputClassName="middle"
          value={customerForm.name_kana}
          setState={setCustomerForm}
          errorMessage={errorMessages["customer.name_kana"] ?? ""}
        />
        {category === "education" && (
          <InputField
            name="phone_number"
            label="電話番号"
            type="text"
            labelClassName="text required"
            inputClassName="middle"
            value={customerForm.phone_number}
            setState={setCustomerForm}
            errorMessage={errorMessages["customer.phone_number"] ?? ""}
          />
        )}
        {category === "welfare" && (
          <>
            <SelectField
              label="契約識別："
              options={contractOptions}
              value={customerForm.contract_status}
              name="contract_status"
              setState={setCustomerForm}
            />
            <SelectField
              label="車椅子の使用："
              options={wHOptions}
              value={customerForm.wc}
              name="wc"
              setState={setCustomerForm}
            />
            <SelectField
              label="添乗員："
              options={tenjoOptions}
              value={customerForm.need_helper}
              name="need_helper"
              setState={setCustomerForm}
            />
            <div className="spacer"></div>
            <div>
              <div className="flex" style={{ gap: "none", margin: 0 }}>
                <SelectField
                  label="歩行器の使用："
                  options={walkerOptions}
                  value={customerForm.walker}
                  name="walker"
                  setState={setCustomerForm}
                />
                {customerForm.walker === 1 && (
                  <SelectField
                    label="歩行器の大きさ："
                    options={walkingAidSizeOptions}
                    value={customerForm.walker_size}
                    name="walker_size"
                    setState={setCustomerForm}
                  />
                )}
              </div>
              <div style={{ marginTop: "15px" }}>
                <InputField
                  label="契約開始日"
                  type="date"
                  labelClassName="date"
                  name="contract_start_date"
                  value={customerForm.contract_start_date}
                  setState={setCustomerForm}
                />
              </div>
            </div>
          </>
        )}
      </fieldset>
      {category === "welfare" && (
        <fieldset className="point">
          <ImageField
            file={customerForm.image}
            labelName="顔写真"
            name="image"
            setState={setCustomerForm}
            aspectW={240}
            aspectH={300}
          />
          <div className="note">
            <legend>歩行注意事項</legend>
            <TextareaField
              labelClassName="textarea"
              name="walking_note"
              value={customerForm.walking_note}
              setState={setCustomerForm}
            />
          </div>
        </fieldset>
      )}
      </div>
      {modalOpen && (
        <div className="modalSCT active">
          <div className="mask" onClick={() => {
            setModalOpen(false);
            setUserForm({
              email_or_id: "",
              password: "",
            });
            setUserFormErrorMessages({});
          }}></div>
          <div className="cont">
            <div className="close" onClick={() => {
              setModalOpen(false);
              setUserForm({
                email_or_id: "",
                password: "",
              });
              setUserFormErrorMessages({});
            }}></div>
            <div className="inner wide USER">
              <div className="sortSCT">
                <div className="head">
                  <h2>
                    <FontAwesomeIcon icon={faUser} />
                    ユーザー登録
                  </h2>
                </div>
                <div className="sort">
                  <div className="searchbox">
                    <fieldset>
                      <InputField
                        name="email_or_id"
                        label="メールアドレスまたはID："
                        type="text"
                        labelClassName="text required"
                        inputClassName="middle"
                        value={userForm.email_or_id}
                        setState={setUserForm}
                        errorMessage={userFormErrorMessages["user.email_or_id"] || userFormErrorMessages["user.user_id"] || ""}
                      />
                      <InputField
                        name="password"
                        label="パスワード："
                        type="text"
                        labelClassName="text required"
                        inputClassName="middle"
                        value={userForm.password}
                        setState={setUserForm}
                        errorMessage={userFormErrorMessages["user.password"] || ""}
                      />
                    </fieldset>
                  </div>
                </div>
                <div className="submitbox">
                  <button type="button" onClick={handleUserRegister}>
                    <FontAwesomeIcon icon={faSave} />
                    登録
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CustomerFormField;
