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

const UsersPage = () => {
  const router = useRouter();
  const { signOut } = useUser();
  const httpClient = new HttpClient();
  const [userData, setUserData] = useState<Customer | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [scheduleData, setScheduleData] = useState<Mergedata[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    // 現在の日付を設定
    setCurrentDate(moment().format("YYYY年 M月 D日"));

    // ユーザー情報とスケジュール情報を取得
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
        // スケジュール情報を取得
        await fetchScheduleData(userResponse.data.customer.cd);
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

  // デフォルトのピックアップ地点の緯度経度を取得
  const getDefaultHomeLocation = (): { lat: number; lng: number } => {
    if (!userData || !userData.default_pick_up_point_order) {
      return { lat: 0, lng: 0 };
    }

    const defaultAddress = addresses.find(
      (addr) => addr.order === userData.default_pick_up_point_order,
    );

    if (defaultAddress && defaultAddress.lat && defaultAddress.lng) {
      return {
        lat: Number(defaultAddress.lat),
        lng: Number(defaultAddress.lng),
      };
    }

    return { lat: 0, lng: 0 };
  };

  const fetchScheduleData = async (userCd: string) => {
    try {
      const today = new Date();
      const dateStr =
        today.getFullYear().toString() +
        (today.getMonth() + 1).toString().padStart(2, "0") +
        today.getDate().toString().padStart(2, "0");

      const url = "/customers/mergedatas";
      const params = {
        params: {
          search_params: {
            date: dateStr,
            customer_cd: userCd,
          },
        },
      };
      const scheduleResponse = await httpClient.get<ResponseMergedatas>(
        url,
        params,
      );
      if (
        scheduleResponse.data &&
        scheduleResponse.data.mergedatas.length > 0
      ) {
        setScheduleData(scheduleResponse.data.mergedatas);
      }
    } catch (error) {
      console.error("スケジュール情報の取得に失敗しました:", error);
    }
  };

  const handleCarMapClick = (schedule: Mergedata) => {
    const carId = schedule.car_id ? schedule.car_id.toString() : "0";
    let lat: string = "0";
    let lng: string = "0";

    // 迎え（soge_type=1）の場合はlat1, lng1を使用
    // 送り（soge_type=2）の場合はlat3, lng3を使用
    if (schedule.soge_type === "1") {
      // お迎え
      lat = schedule.lat1 && schedule.lat1 > 0 ? schedule.lat1.toString() : "0";
      lng = schedule.lng1 && schedule.lng1 > 0 ? schedule.lng1.toString() : "0";
    } else if (schedule.soge_type === "2") {
      // お送り
      lat = schedule.lat3 && schedule.lat3 > 0 ? schedule.lat3.toString() : "0";
      lng = schedule.lng3 && schedule.lng3 > 0 ? schedule.lng3.toString() : "0";
    } else {
      // デフォルトのピックアップ地点の緯度経度を取得（フォールバック）
      const homeLocation = getDefaultHomeLocation();
      lat = homeLocation.lat > 0 ? homeLocation.lat.toString() : "0";
      lng = homeLocation.lng > 0 ? homeLocation.lng.toString() : "0";
    }

    // 車両位置表示ページに遷移
    router.push(`/users/carmap?carid=${carId}&lat=${lat}&lng=${lng}`);
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
        <h3>
          <span className={styles["h2-span"]}>
            　本日　
            <span style={{ fontSize: "5vmin", color: "#333" }}>
              {currentDate}
            </span>
            　の予定
          </span>
        </h3>
      </div>

      {!scheduleData || scheduleData.length === 0 ? (
        <div style={{ padding: "30vmax 0" }}>
          <p
            style={{
              margin: 0,
              padding: "3vmax 0",
              fontSize: "4vmin",
              fontWeight: "600",
              textAlign: "center",
            }}
          >
            本日の送迎はございません
          </p>
          <div style={{ textAlign: "center" }}>
            <button
              className={`${styles.btn1} ${styles["btn-blue"]}`}
              onClick={() => router.push("/users/select")}
            >
              戻る
            </button>
          </div>
        </div>
      ) : (
        <div>
          {/* お迎えセクション（soge_type=1） */}
          {(() => {
            const pickupSchedules = scheduleData.filter(
              (schedule) => schedule.soge_type === "1",
            );
            return pickupSchedules.length > 0 ? (
              <div className={`${styles.box1} ${styles.blue0}`}>
                <div className={`${styles["box1-contents"]} ${styles.blue2}`}>
                  <h3>お迎え</h3>
                  {pickupSchedules.map((schedule, index) => (
                    <div key={`pickup-${index}`}>
                      {schedule.scheduled_time ? (
                        <div>
                          <div className={`${styles.box2} ${styles.blue1}`}>
                            <div>
                              ご自宅到着予定時刻　▶　
                              <span className={styles.strong1}>
                                {schedule.scheduled_time || ""}
                              </span>
                            </div>
                            <hr className={styles["hr-blue"]} />
                            <div>
                              車両番号　▶　
                              <span className={styles.strong1}>
                                {schedule.car_number}号車
                              </span>
                            </div>
                          </div>

                          <p className={styles["box-flex"]}>
                            <span
                              className={
                                schedule.bindatad?.boarding_time
                                  ? `${styles.box3} ${styles.blue2}`
                                  : `${styles.box3} ${styles["blue2-dashed"]}`
                              }
                            >
                              {schedule.bindatad?.boarding_time
                                ? `乗車完了 ${schedule.bindatad.boarding_time}`
                                : "ご乗車前です"}
                            </span>
                            <span
                              className={
                                schedule.bindatad?.alighting_time
                                  ? `${styles.box3} ${styles.blue2}`
                                  : `${styles.box3} ${styles["blue2-dashed"]}`
                              }
                            >
                              {schedule.bindatad?.alighting_time
                                ? `降車完了 ${schedule.bindatad.alighting_time}`
                                : "ご降車前です"}
                            </span>
                          </p>

                          <button
                            className={`${styles.btn1} ${styles["btn-blue"]}`}
                            onClick={() => handleCarMapClick(schedule)}
                            disabled={!!schedule.bindatad?.alighting_time}
                          >
                            現在の車両位置を見る
                          </button>
                        </div>
                      ) : (
                        <p
                          style={{
                            margin: 0,
                            padding: "10vmax 0",
                            fontSize: "4vmin",
                            fontWeight: "600",
                            textAlign: "center",
                          }}
                        >
                          お迎え時間は未定です
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className={`${styles.box1} ${styles.blue0}`}>
                <div className={`${styles["box1-contents"]} ${styles.blue2}`}>
                  <h3>お迎え</h3>
                  <p
                    style={{
                      margin: 0,
                      padding: "10vmax 0",
                      fontSize: "4vmin",
                      fontWeight: "600",
                      textAlign: "center",
                    }}
                  >
                    お迎えの予定はございません
                  </p>
                </div>
              </div>
            );
          })()}

          {/* お送りセクション（soge_type=2） */}
          {(() => {
            const dropoffSchedules = scheduleData.filter(
              (schedule) => schedule.soge_type === "2",
            );
            return dropoffSchedules.length > 0 ? (
              <div className={`${styles.box1} ${styles.orange0}`}>
                <div className={`${styles["box1-contents"]} ${styles.orange2}`}>
                  <h3>お送り</h3>
                  {dropoffSchedules.map((schedule, index) => (
                    <div key={`dropoff-${index}`}>
                      {schedule.scheduled_time ? (
                        <div>
                          <div className={`${styles.box2} ${styles.orange1}`}>
                            <div>
                              ご自宅到着予定時刻　▶　
                              <span className={styles.strong1}>
                                {schedule.scheduled_time || ""}
                              </span>
                            </div>
                            <hr className={styles["hr-orange"]} />
                            <div>
                              車両番号　▶　
                              <span className={styles.strong1}>
                                {schedule.car_number}号車
                              </span>
                            </div>
                          </div>

                          <p className={styles["box-flex"]}>
                            <span
                              className={
                                schedule.bindatad?.boarding_time
                                  ? `${styles.box3} ${styles.orange2}`
                                  : `${styles.box3} ${styles["orange2-dashed"]}`
                              }
                            >
                              {schedule.bindatad?.boarding_time
                                ? `乗車完了 ${schedule.bindatad.boarding_time}`
                                : "ご乗車前です"}
                            </span>
                            <span
                              className={
                                schedule.bindatad?.alighting_time
                                  ? `${styles.box3} ${styles.orange2}`
                                  : `${styles.box3} ${styles["orange2-dashed"]}`
                              }
                            >
                              {schedule.bindatad?.alighting_time
                                ? `降車完了 ${schedule.bindatad.alighting_time}`
                                : "ご降車前です"}
                            </span>
                          </p>

                          <button
                            className={`${styles.btn1} ${styles["btn-orange"]}`}
                            onClick={() => handleCarMapClick(schedule)}
                            disabled={
                              !schedule.bindatad?.boarding_time ||
                              !!schedule.bindatad?.alighting_time
                            }
                          >
                            現在の車両位置を見る
                          </button>
                        </div>
                      ) : (
                        <p
                          style={{
                            margin: 0,
                            padding: "10vmax 0",
                            fontSize: "4vmin",
                            fontWeight: "600",
                            textAlign: "center",
                          }}
                        >
                          お送り時間は未定です
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className={`${styles.box1} ${styles.orange0}`}>
                <div className={`${styles["box1-contents"]} ${styles.orange2}`}>
                  <h3>お送り</h3>
                  <p
                    style={{
                      margin: 0,
                      padding: "10vmax 0",
                      fontSize: "4vmin",
                      fontWeight: "600",
                      textAlign: "center",
                    }}
                  >
                    お送りの予定はございません
                  </p>
                </div>
              </div>
            );
          })()}
          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <button
              className={`${styles.btn1} ${styles["btn-blue"]}`}
              onClick={() => router.push("/users/select")}
            >
              戻る
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
