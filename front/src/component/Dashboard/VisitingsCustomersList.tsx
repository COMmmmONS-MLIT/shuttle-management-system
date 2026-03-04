import { useState, useEffect } from "react";
import moment from "moment";
import getVisitingsCustomers from "@/component/Visiting/Request/getVisitingsCustomers";
import getTourismVisitingsCustomers from "@/component/Visiting/Request/getTourismVisitingsCustomers";
import getEducationVisitingsCustomers from "@/component/Visiting/Request/getEducationVisitingsCustomers";
import InputField from "@/component/FormControls/InputField";
import CheckboxField from "@/component/FormControls/CheckboxField";
import VisitingTableList from "@/component/Visiting/TableList";
import TourismTableList from "@/component/Visiting/TourismTableList";
import EducationTableList from "@/component/Visiting/EducationTableList";

// context
import { useUser } from "@/contexts/UserContext";

// types
import {
  VisitingsCustomerPair,
  VisitingsCustomerSearchParams,
  TourismVisitingsCustomer,
  RequestedVisitingsCustomer,
  EducationVisitingsCustomer,
} from "@/types/visitingsCustomer";

// font awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClinicMedical,
  faBus,
  faSearch,
  faUndoAlt,
} from "@fortawesome/free-solid-svg-icons";

type Props = {
  date: string;
  onRequestSuccess?: () => void;
  refreshKey?: number;
  setTourismEditData?: React.Dispatch<
    React.SetStateAction<TourismVisitingsCustomer | undefined>
  >;
  setModal?: React.Dispatch<React.SetStateAction<string | null>>;
};

const VisitingsCustomersList = ({
  date,
  onRequestSuccess,
  refreshKey,
  setTourismEditData,
  setModal,
}: Props) => {
  const { category } = useUser();
  const [visitingsCustomers, setVisitingsCustomers] = useState<
    VisitingsCustomerPair[]
  >([]);
  const [tourismVisitingsCustomers, setTourismVisitingsCustomers] = useState<
    TourismVisitingsCustomer[]
  >([]);
  const [educationVisitingsCustomers, setEducationVisitingsCustomers] =
    useState<EducationVisitingsCustomer[]>([]);
  const [requestedVisitingsCustomers, setRequestedVisitingsCustomers] =
    useState<RequestedVisitingsCustomer[]>([]);
  const [searchParams, setSearchParams] =
    useState<VisitingsCustomerSearchParams>({
      customer_cd_or_kana: "",
      is_absent: "",
      order: "kana_asc",
      start_date: date,
      end_date: date,
    });

  useEffect(() => {
    fetchVisitingsCustomers(searchParams);
  }, [
    date,
    category,
    refreshKey,
    searchParams.start_date,
    searchParams.end_date,
  ]);

  const fetchVisitingsCustomers = async (
    params: VisitingsCustomerSearchParams,
  ) => {
    const searchParams = {
      ...params,
      date: date,
    };
    if (category === "tourism") {
      const res = await getTourismVisitingsCustomers(searchParams);
      setTourismVisitingsCustomers(res.visitings_customers);
    } else if (category === "education") {
      const res = await getEducationVisitingsCustomers(searchParams);
      setEducationVisitingsCustomers(res.visitings_customers);
    } else {
      const res = await getVisitingsCustomers(searchParams);
      setVisitingsCustomers(res.visitings_customers);
      setRequestedVisitingsCustomers(res.requested_visitings_customers);
    }
  };

  const search = () => {
    fetchVisitingsCustomers(searchParams);
  };

  const resetSearchParams = () => {
    setSearchParams({
      customer_cd_or_kana: "",
      is_absent: "",
      order: "kana_asc",
      start_date: date,
      end_date: date,
    });
    fetchVisitingsCustomers({
      customer_cd_or_kana: "",
      is_absent: "",
      order: "kana_asc",
      start_date: date,
      end_date: date,
    });
  };

  return (
    <section>
      <div className="visitSCT">
        <div className="cont">
          <div className="head">
            <h2>
              <FontAwesomeIcon
                icon={
                  category === "tourism" || category === "education"
                    ? faBus
                    : faClinicMedical
                }
              />
              {category === "tourism" || category === "education"
                ? "送迎予約"
                : "来館予定"}
            </h2>
          </div>

          <div className="sort">
            <div className="searchbox">
              <fieldset>
                <InputField
                  name="customer_cd_or_kana"
                  label="利用者:"
                  type="search"
                  labelClassName="keyword"
                  placeholder="フリガナ、IDを入力"
                  setState={setSearchParams}
                  value={searchParams.customer_cd_or_kana}
                />
                {category === "welfare" && (
                  <CheckboxField
                    name="is_absent"
                    label="休み"
                    checked={!!searchParams.is_absent}
                    setState={setSearchParams}
                  />
                )}
                <button
                  onClick={() => search()}
                  type="submit"
                  aria-label="検索"
                >
                  <FontAwesomeIcon icon={faSearch} style={{ marginLeft: 0 }} />
                  検索
                </button>
                <button
                  type="button"
                  aria-label="リセット"
                  className="sub"
                  onClick={resetSearchParams}
                >
                  <FontAwesomeIcon icon={faUndoAlt} />
                  リセット
                </button>
              </fieldset>
            </div>
          </div>
          {category === "tourism" ? (
            <TourismTableList
              searchParams={searchParams}
              setSearchParams={setSearchParams}
              visitingsCustomers={tourismVisitingsCustomers}
              handleEdit={(data: TourismVisitingsCustomer) => {
                if (setTourismEditData) {
                  setTourismEditData(data);
                }
                if (setModal) {
                  setModal("tourism_register");
                }
              }}
              fetchVisitingsCustomers={fetchVisitingsCustomers}
              dashboard={true}
              onRequestSuccess={onRequestSuccess}
            />
          ) : category === "education" ? (
            <EducationTableList
              searchParams={searchParams}
              setSearchParams={setSearchParams}
              visitingsCustomers={educationVisitingsCustomers}
              fetchVisitingsCustomers={fetchVisitingsCustomers}
              handleEdit={() => {}}
              dashboard={true}
              onRequestSuccess={onRequestSuccess}
            />
          ) : (
            <VisitingTableList
              searchParams={searchParams}
              setSearchParams={setSearchParams}
              visitingsCustomers={visitingsCustomers}
              fetchVisitingsCustomers={fetchVisitingsCustomers}
              handleEdit={() => {}}
              dashboard={true}
              onRequestSuccess={onRequestSuccess}
            />
          )}
        </div>
      </div>
    </section>
  );
};

export default VisitingsCustomersList;
