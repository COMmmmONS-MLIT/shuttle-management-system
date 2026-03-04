import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import VisitingTableArea from "@/component/Visiting/TableArea";
import BulkRegister from "@/component/Visiting/Modal/BulkRegister";
import IndividualRegister from "@/component/Visiting/Modal/IndividualRegister";
import EducationRegister from "@/component/Visiting/Modal/EducationRegister";
import RequestedCustomerUpdater from "@/component/Visiting/Modal/RequestedCustomerUpdater";
import isValidDate from "@/component/Widgets/isValidDate";
import moment from "moment";

// font awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClinicMedical,
  faUsers,
  faUser,
  faCar,
} from "@fortawesome/free-solid-svg-icons";

// types
import { IndividualRegisterForm } from "@/types/visitingsCustomer";
import {
  EducationVisitingsCustomer,
  RequestedVisitingsCustomer,
} from "@/types/visitingsCustomer";

// context
import { useUser } from "@/contexts/UserContext";

const VisitingPage = () => {
  const { category, onlyScheduleCreate, officeName } = useUser();
  const router = useRouter();
  const paramsDate = router.query.date as string | undefined;
  const today = moment().format("YYYY-MM-DD");
  const [date, setDate] = useState<string>(
    isValidDate(paramsDate) ? paramsDate! : today
  );
  const [modal, setModal] = useState<string | null>(null);
  const [editData, setEditData] = useState<
    IndividualRegisterForm | undefined
  >();
  const [educationEditData, setEducationEditData] = useState<
    EducationVisitingsCustomer | undefined
  >();
  const [requestedEditData, setRequestedEditData] = useState<
    RequestedVisitingsCustomer | undefined
  >();
  const [reloadKey, setReloadKey] = useState(0);

  // クエリパラメータが変更された時（ブラウザバック等）
  useEffect(() => {
    if (
      router.query.date &&
      isValidDate(router.query.date as string) &&
      router.query.date !== date
    ) {
      setDate(router.query.date as string);
      setReloadKey((prev) => prev + 1);
    }
  }, [router.query.date]);

  // フォームで日付が変更された時
  useEffect(() => {
    if (date && date !== router.query.date && isValidDate(date)) {
      router.push(`/visiting?date=${date}`, undefined, { shallow: true });
      setReloadKey((prev) => prev + 1);
    }
  }, [date]);

  const handleReload = () => {
    setReloadKey((prev) => prev + 1);
  };

  const OpenIndividualRegisterModal = () => {
    setEditData(undefined);
    setEducationEditData(undefined);
    const modalName =
      category === "education" ? "education_register" : "individual_register";
    setModal(modalName);
  };

  return (
    <div id="contents">
      <section>
        <div className="headSCT">
          <div className="cont">
            <h1>
              <FontAwesomeIcon
                icon={
                  category === "education"
                    ? faCar
                    : faClinicMedical
                }
              />
              {category === "education"
                ? "送迎予約一覧"
                : "来館一覧"}
            </h1>
            {!onlyScheduleCreate && (
              <ul className="button">
                <li>
                  <a
                    className="main js-modalLink"
                    data-modal="USERS"
                    style={{ cursor: "pointer" }}
                    onClick={() => setModal("bulk_register")}
                  >
                    <FontAwesomeIcon icon={faUsers} />
                    一括登録
                  </a>
                </li>
                <li>
                  <a
                    className="main js-modalLink"
                    data-modal="USER"
                    style={{ cursor: "pointer" }}
                    onClick={OpenIndividualRegisterModal}
                  >
                    <FontAwesomeIcon icon={faUser} />
                    個別登録
                  </a>
                </li>
              </ul>
            )}
            {officeName && (
              <div className="officeNameDisplay">
                {officeName}
              </div>
            )}
            <div className="sort"></div>
          </div>
        </div>
      </section>
      <VisitingTableArea
        setModal={setModal}
        setEditData={setEditData}
        setEducationEditData={setEducationEditData}
        setRequestedEditData={setRequestedEditData}
        reloadKey={reloadKey}
        date={date}
        setDate={setDate}
      />
      {modal === "bulk_register" && (
        <BulkRegister setModal={setModal} onSuccess={handleReload} />
      )}
      {modal === "individual_register" && (
        <IndividualRegister
          setModal={setModal}
          date={date}
          initialData={editData}
          isEdit={!!editData}
          onSuccess={handleReload}
        />
      )}
      {modal === "education_register" && (
        <EducationRegister
          setModal={setModal}
          date={date}
          initialData={educationEditData}
          isEdit={!!educationEditData}
          onSuccess={handleReload}
        />
      )}
      {modal === "requested_customer_updater" && (
        <RequestedCustomerUpdater
          setModal={setModal}
          date={date}
          initialData={requestedEditData}
          onSuccess={handleReload}
        />
      )}
    </div>
  );
};

export default VisitingPage;
