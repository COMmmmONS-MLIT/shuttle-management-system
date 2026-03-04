import React, { useState, useEffect } from "react";
import InputField from "@/component/FormControls/InputField";
import moment from "moment";
import getVisitingsCustomers from "@/component/Visiting/Request/getVisitingsCustomers";
import getEducationVisitingsCustomers from "@/component/Visiting/Request/getEducationVisitingsCustomers";
import CheckboxField from "@/component/FormControls/CheckboxField";
import VisitingTableList from "@/component/Visiting/TableList";
import EducationTableList from "@/component/Visiting/EducationTableList";
import RequestingCustomersTable from "@/component/RequestingCustomers/RequestingCustomersTable";
import HttpClient from "@/adapter/HttpClient";
import { ErrorToast } from "@/component/ReactHotToast/ToastMessage";
import { useUser } from "@/contexts/UserContext";
import { useRouter } from "next/router";
import {
  parseQueryToParams,
  pushSearchParamsToUrl,
} from "@/component/Widgets/SearchParamsSync";
// Types
import {
  VisitingsCustomerPair,
  EducationVisitingsCustomer,
  VisitingsCustomerSearchParams,
  RequestedVisitingsCustomer,
} from "@/types/visitingsCustomer";
import { IndividualRegisterForm } from "@/types/visitingsCustomer";
import RequestedCustomer from "@/types/requestedCustomer";
import RequestedCustomerResponse from "@/types/ApiResponse/requestedCustomer";

//font awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faUndoAlt,
  faFilter,
} from "@fortawesome/free-solid-svg-icons";

type Props = {
  setModal: React.Dispatch<React.SetStateAction<string | null>>;
  setEditData: React.Dispatch<
    React.SetStateAction<IndividualRegisterForm | undefined>
  >;
  setEducationEditData: React.Dispatch<
    React.SetStateAction<EducationVisitingsCustomer | undefined>
  >;
  setRequestedEditData: React.Dispatch<
    React.SetStateAction<RequestedVisitingsCustomer | undefined>
  >;
  reloadKey: number;
  date: string;
  setDate: React.Dispatch<React.SetStateAction<string>>;
};

const today = moment().format("YYYY-MM-DD");

const DEFAULT_VISITINGS_SEARCH_PARAMS: VisitingsCustomerSearchParams = {
  customer_cd_or_kana: "",
  is_absent: "",
  order: "kana_asc",
  start_date: today,
  end_date: today,
};

const VisitingTableArea = ({
  setModal,
  setEditData,
  setEducationEditData,
  setRequestedEditData,
  reloadKey,
  date,
  setDate,
}: Props) => {
  const { category } = useUser();
  const router = useRouter();

  const [visitingsCustomers, setVisitingsCustomers] = useState<
    VisitingsCustomerPair[]
  >([]);
  const [educationVisitingsCustomers, setEducationVisitingsCustomers] =
    useState<EducationVisitingsCustomer[]>([]);
  const [requestedVisitingsCustomers, setRequestedVisitingsCustomers] =
    useState<RequestedVisitingsCustomer[]>([]);
  const [requestingCustomers, setRequestingCustomers] = useState<
    RequestedCustomer[]
  >([]);
  const [searchParams, setSearchParams] =
    useState<VisitingsCustomerSearchParams>(DEFAULT_VISITINGS_SEARCH_PARAMS);
  const httpClient = new HttpClient();

  useEffect(() => {
    fetchVisitingsCustomers(searchParams);
    fetchRequestingCustomers();
  }, [
    router.query,
    reloadKey,
    searchParams.start_date,
    searchParams.end_date,
    searchParams.customer_cd_or_kana,
    searchParams.is_absent,
    searchParams.order,
    date,
  ]);

  const fetchVisitingsCustomers = async (
    params: VisitingsCustomerSearchParams
  ) => {
    const requestParams = {
      ...params,
    };
    if (category === "education") {
      const res = await getEducationVisitingsCustomers(requestParams);
      setEducationVisitingsCustomers(res.visitings_customers);
    } else {
      const res = await getVisitingsCustomers(requestParams);
      setVisitingsCustomers(res.visitings_customers);
      setRequestedVisitingsCustomers(res.requested_visitings_customers);
    }
  };

  const fetchRequestingCustomers = async () => {
    try {
      const url = "/requested_customers";
      const params = {
        params: {
          start_date: searchParams.start_date || today,
          end_date: searchParams.end_date || today,
        },
      };
      const res = await httpClient.get<RequestedCustomerResponse>(url, params);
      setRequestingCustomers(res.data.requesting_customers);
    } catch (err: any) {
      ErrorToast("送迎委託の取得に失敗しました");
    }
  };

  const search = () => {
    // 利用者 / 休み の検索条件を URL クエリに反映
    pushSearchParamsToUrl(router, searchParams, { date });
  };

  const resetSearchParams = () => {
    setSearchParams(DEFAULT_VISITINGS_SEARCH_PARAMS);
  };

  const handleEdit = (data: IndividualRegisterForm) => {
    setEditData(data);
    setModal("individual_register");
  };

  const handleEducationEdit = (data: EducationVisitingsCustomer) => {
    setEducationEditData(data);
    setModal("education_register");
  };

  const handleRequestedEdit = (data: RequestedVisitingsCustomer) => {
    setRequestedEditData(data);
    setModal("requested_customer_updater");
  };

  const tableArea = () => {
    if (category === "education") {
      return (
        <EducationTableList
          searchParams={searchParams}
          setSearchParams={setSearchParams}
          visitingsCustomers={educationVisitingsCustomers}
          handleEdit={handleEducationEdit}
          fetchVisitingsCustomers={fetchVisitingsCustomers}
          onRequestSuccess={() => {
            fetchRequestingCustomers();
          }}
        />
      );
    } else {
      return (
        <VisitingTableList
          searchParams={searchParams}
          setSearchParams={setSearchParams}
          visitingsCustomers={visitingsCustomers}
          handleEdit={handleEdit}
          fetchVisitingsCustomers={fetchVisitingsCustomers}
          onRequestSuccess={() => {
            fetchRequestingCustomers();
          }}
        />
      );
    }
  };

  return (
    <div id="contents" style={{ margin: 0, padding: 0 }}>
      <section>
        <div className="sortSCT">
          <div className="cont">
            <div className="head">
              <h2>
                <FontAwesomeIcon icon={faFilter} />
                絞り込む
              </h2>
              <button
                type="button"
                aria-label="リセット"
                className="sub"
                onClick={resetSearchParams}
              >
                <FontAwesomeIcon icon={faUndoAlt} />
                リセット
              </button>
            </div>
            <div className="sort">
              <div className="searchbox">
                <fieldset>
                  <InputField
                    name="customer_cd_or_kana"
                    label="利用者:"
                    type="search"
                    labelClassName="keyword"
                    placeholder="名前、IDを入力"
                    setState={setSearchParams}
                    value={searchParams.customer_cd_or_kana}
                  />
                  <CheckboxField
                    name="is_absent"
                    label="休み"
                    checked={!!searchParams.is_absent}
                    setState={setSearchParams}
                  />
                </fieldset>
              </div>
            </div>
            <div className="submitbox" style={{ marginBottom: "20px" }}>
              <button onClick={() => search()} type="button" aria-label="検索">
                <FontAwesomeIcon icon={faSearch} style={{ marginLeft: 0 }} />
                検索
              </button>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="userSCT">
          <div className="cont">{tableArea()}</div>
        </div>
      </section>

      <RequestingCustomersTable
        requestingCustomers={requestingCustomers}
        showCancelButton={true}
        showDateColumn={true}
        onCancelSuccess={() => {
          fetchRequestingCustomers();
          fetchVisitingsCustomers(searchParams);
        }}
      />
    </div>
  );
};

export default VisitingTableArea;
