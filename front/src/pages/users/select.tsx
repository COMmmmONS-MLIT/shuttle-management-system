import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import moment from "moment";
import HttpClient from "@/adapter/HttpClient";
import {
  ErrorToast,
  SuccessToast,
} from "@/component/ReactHotToast/ToastMessage";
import styles from "@/styles/css/yoteOta.module.css";
import SelectField from "@/component/FormControls/SelectField";
import InputField from "@/component/FormControls/InputField";
import { useUser } from "@/contexts/UserContext";
import { ResponseCustomer } from "@/types/ApiResponse/customer";
import { ResponseMergedatas } from "@/types/ApiResponse/mergedata";
import Link from "next/link";

// types
import SuccessResponse from "@/types/ApiResponse/success";
import { Mergedata } from "@/types/mergedata";
import { Customer } from "@/types/customer";
import { Address } from "@/types/address";

// fontawesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCar, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";

const UsersSelectPage = () => {
  const router = useRouter();
  const { signOut, user } = useUser();
  const httpClient = new HttpClient();
  const [userData, setUserData] = useState<Customer | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [requestForm, setRequestForm] = useState({
    date: moment().format("YYYY-MM-DD"),
    address_order: null as number | null,
    departure_time: "",
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      // ユーザー情報を取得（実際のAPIエンドポイントに変更）
      const url = "/customers/customer";
      const userResponse = await httpClient.get<ResponseCustomer>(url);
      if (userResponse.data && userResponse.data.customer) {
        setUserData(userResponse.data.customer);
        // 住所情報を取得
        if (userResponse.data.addresses) {
          setAddresses(userResponse.data.addresses);
        }
      } else {
        setUserData({ cd: "unknown", name: "unknown" } as Customer);
      }
    } catch (error) {
      console.error("ユーザー情報の取得に失敗しました:", error);
      ErrorToast("ユーザー情報の取得に失敗しました");
      setUserData({ cd: "unknown", name: "unknown" } as Customer);
    } finally {
      setLoading(false);
    }
  };

  const moveToUsersPage = () => {
    router.push("/users");
  };

  const openRequestModal = () => {
    setIsModalOpen(true);
    setRequestForm({
      date: moment().format("YYYY-MM-DD"),
      address_order: addresses[0].order,
      departure_time: "",
    });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleRequestToOffice = () => {
    const selectedAddressData = addresses.find(
      (addr) => addr.order === requestForm.address_order,
    );

    const url = "/customers/customer/create_request_notification";
    const params = {
      address_label: selectedAddressData?.address_label,
      departure_time: requestForm.departure_time,
      date: requestForm.date,
      customer_id: user?.customer_id,
    };

    httpClient
      .post<SuccessResponse>(url, params)
      .then((res) => {
        SuccessToast(res.data.messages);
        handleCloseModal();
      })
      .catch((error) => {
        const errorMessages = error.response?.data?.full_messages;
        ErrorToast(errorMessages);
      });
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "18px",
        }}
      >
        読み込み中...
      </div>
    );
  }

  return (
    <div className={styles["test-page"]}>
      {/* ヘッダー情報 */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: "#395A5B",
          fontSize: "3.5vmin",
          fontWeight: "650",
          margin: "0 3vmin",
        }}
      >
        <span style={{ height: "40px", lineHeight: "40px" }}>
          利用者番号：{userData?.cd}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "3vmin" }}>
          <span style={{ height: "40px", lineHeight: "40px" }}>
            {userData?.name} 様
          </span>
          <Link
            href="#"
            onClick={(e) => {
              e.preventDefault();
              signOut();
            }}
          >
            <FontAwesomeIcon icon={faSignOutAlt} />
          </Link>
        </div>
      </div>

      <div className={styles.h2}>
        <button
          className={`${styles.btn1} ${styles["btn-blue"]}`}
          onClick={moveToUsersPage}
        >
          送迎を確認する
        </button>
      </div>

      <div className={styles.h2}>
        <button
          className={`${styles.btn1} ${styles["btn-blue"]}`}
          onClick={openRequestModal}
        >
          送迎をリクエストする
        </button>
      </div>

      {/* 送迎リクエストモーダル */}
      {isModalOpen && (
        <section>
          <div className="modalSCT active">
            <div className="mask" onClick={handleCloseModal}></div>
            <div
              className="cont"
              style={{ maxWidth: "500px", width: "90%", margin: "0 auto" }}
            >
              <div className="close" onClick={handleCloseModal}></div>
              <div className="inner wide USER">
                <div className="sortSCT">
                  <div className="head">
                    <h2>
                      <FontAwesomeIcon icon={faCar} />
                      送迎リクエスト
                    </h2>
                  </div>
                  <div className="sort">
                    <div className="searchbox">
                      <fieldset>
                        <label className="date">
                          <InputField
                            type="date"
                            label="日付："
                            value={requestForm.date}
                            setState={setRequestForm}
                            name="date"
                          />
                        </label>
                      </fieldset>
                      <fieldset>
                        <SelectField
                          label="迎え場所の選択："
                          name="address_order"
                          options={addresses.map((addr) => ({
                            label: addr.address_label,
                            value: addr.order,
                          }))}
                          value={requestForm.address_order || undefined}
                          setState={setRequestForm}
                        />
                      </fieldset>
                      <fieldset>
                        <InputField
                          label="迎えの乗車時間："
                          name="departure_time"
                          type="time"
                          labelClassName="time"
                          value={requestForm.departure_time}
                          setState={setRequestForm}
                        />
                      </fieldset>
                    </div>
                  </div>
                  <div
                    className="submitbox"
                    style={{ display: "flex", justifyContent: "center" }}
                  >
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="sub"
                      style={{
                        flex: "1 1 auto",
                        maxWidth: "auto",
                        minWidth: "140px",
                      }}
                    >
                      キャンセル
                    </button>
                    <button
                      type="button"
                      onClick={handleRequestToOffice}
                      style={{
                        flex: "1 1 auto",
                        maxWidth: "auto",
                        minWidth: "140px",
                      }}
                    >
                      リクエスト送信
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default UsersSelectPage;
