import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  UnreadNotifications,
  AllNotifications,
} from "@/component/Dashboard/Notifications";
import Statistics from "@/component/Dashboard/Statistics";
import RequestedCustomers from "@/component/Dashboard/RequestedCustomers/RequestedCustomers";
import CalendarTimeline from "@/component/Dashboard/Calendar/Timeline";
import VisitingsCustomersList from "@/component/Dashboard/VisitingsCustomersList";
import InputField from "@/component/FormControls/InputField";
import isValidDate from "@/component/Widgets/isValidDate";
import moment from "moment";

// FontAwesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTachometerAlt, faCar } from "@fortawesome/free-solid-svg-icons";

// context
import { useNotification } from "@/contexts/NotificationContext";
import { useUser } from "@/contexts/UserContext";

// components
import TourismRegister from "@/component/Visiting/Modal/TourismRegister";

// types
import { TourismVisitingsCustomer } from "@/types/visitingsCustomer";

const DashboardPage = () => {
  const router = useRouter();
  const today = moment().format("YYYY-MM-DD");

  const paramsDate = router.query.date as string | undefined;
  const [date, setDate] = useState<string>(
    isValidDate(paramsDate) ? paramsDate! : today,
  );
  const [refreshKey, setRefreshKey] = useState(0);
  const { unreadNotificationCount, notifications, refetchNotifications } =
    useNotification();
  const { officeName, category, onlyScheduleCreate } = useUser();
  const [modal, setModal] = useState<string | null>(null);
  const [tourismEditData, setTourismEditData] = useState<
    TourismVisitingsCustomer | undefined
  >();

  // クエリパラメータが変更された時（ブラウザバック等）
  useEffect(() => {
    if (
      router.query.date &&
      isValidDate(router.query.date as string) &&
      router.query.date !== date
    ) {
      setDate(router.query.date as string);
    }
  }, [router.query.date]);

  // フォームで日付が変更された時
  useEffect(() => {
    if (date && date !== router.query.date && isValidDate(date)) {
      router.push(`/?date=${date}`, undefined, { shallow: true });
    }
  }, [date]);

  const updateDate = (date: string) => {
    if (moment(date).isValid()) {
      setDate(date);
    } else {
      setDate(moment().format("YYYY-MM-DD"));
    }
  };

  const handleRequestSuccess = () => {
    setRefreshKey((prev) => prev + 1);
    refetchNotifications();
  };

  return (
    <div id="contents">
      <section>
        <div className="headSCT">
          <div className="cont">
            <h1>
              <FontAwesomeIcon icon={faTachometerAlt} />
              ダッシュボード
            </h1>
            {category === "tourism" && !onlyScheduleCreate && (
              <ul className="button">
                <li>
                  <a
                    className="main js-modalLink"
                    data-modal="USERS"
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      setTourismEditData(undefined);
                      setModal("tourism_register");
                    }}
                  >
                    <FontAwesomeIcon icon={faCar} />
                    送迎登録
                  </a>
                </li>
              </ul>
            )}
            {officeName && (
              <div className="officeNameDisplay">{officeName}</div>
            )}
          </div>
        </div>
        <div className="dateSCT">
          <div className="selectbox">
            <label className="date">
              <InputField
                type="date"
                label="日付："
                value={date}
                setState={updateDate}
              />
            </label>
          </div>
        </div>
      </section>

      {unreadNotificationCount > 0 && (
        <UnreadNotifications onRequestSuccess={handleRequestSuccess} />
      )}

      <Statistics date={date} />

      <RequestedCustomers
        date={date}
        refreshKey={refreshKey}
        onRequestSuccess={handleRequestSuccess}
      />

      <CalendarTimeline date={date} />

      <VisitingsCustomersList
        date={date}
        onRequestSuccess={handleRequestSuccess}
        refreshKey={refreshKey}
        setTourismEditData={setTourismEditData}
        setModal={setModal}
      />

      {notifications?.length > 0 && <AllNotifications />}

      {modal === "tourism_register" && (
        <TourismRegister
          setModal={setModal}
          date={date}
          initialData={tourismEditData}
          isEdit={!!tourismEditData}
          onSuccess={handleRequestSuccess}
        />
      )}
    </div>
  );
};

export default DashboardPage;
