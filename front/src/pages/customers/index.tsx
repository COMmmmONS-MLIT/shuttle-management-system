import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
import HttpClient from "@/adapter/HttpClient";
import Pagenation from "@/component/Widgets/pagenation";
import InputField from "@/component/FormControls/InputField";
import SelectField from "@/component/FormControls/SelectField";
import CheckboxField from "@/component/FormControls/CheckboxField";
import DataTable from "@/config/tables/DataTable";
import { useCustomerTableColumns } from "@/config/tables/customer/TableConfig";
import removeNullParams from "@/component/Widgets/RemoveEmptyParams";
import {
  SuccessToast,
  ErrorToast,
} from "@/component/ReactHotToast/ToastMessage";
import {
  parseQueryToParams,
  pushSearchParamsToUrl,
} from "@/component/Widgets/SearchParamsSync";

// types
import { PageData } from "@/types/page";
import { Customer, CustomerSearchParams } from "@/types/customer";
import { ResponseCustomers } from "@/types/ApiResponse/customer";
import { DEFAULT_PER_PAGE_OPTIONS } from "@/types/dataTable";

// context
import { useUser } from "@/contexts/UserContext";
// font awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClipboardList,
  faClipboardCheck,
  faFilter,
  faUndoAlt,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";

const status = [
  { label: "-----", value: "" },
  { label: "契約", value: 1 },
  { label: "体験", value: 2 },
  { label: "停止", value: 3 },
];

const stoppedAtOptions = [
  { label: "-----", value: "" },
  { label: "休止日あり", value: "present" },
  { label: "休止日なし", value: "blank" },
];

const DEFAULT_CUSTOMER_SEARCH_PARAMS: CustomerSearchParams = {
  page: 1,
  per: 10,
  order: "",
  contract_status: "",
  customer_id_or_kana: "",
  stopped_at: "blank",
  sunday: null,
  monday: null,
  tuesday: null,
  wednesday: null,
  thursday: null,
  friday: null,
  saturday: null,
};

const UsersPage = () => {
  const router = useRouter();
  const httpClient = new HttpClient();
  const { officeName } = useUser();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerSearchParams, setCustomerSearchParams] =
    useState<CustomerSearchParams>(DEFAULT_CUSTOMER_SEARCH_PARAMS);
  const [customersPageData, setCustomersPageData] = useState<PageData>({
    totalPages: 1,
    currentPage: 1,
    all: 0,
  });

  useEffect(() => {
    const merged = parseQueryToParams<CustomerSearchParams>(
      router.query,
      DEFAULT_CUSTOMER_SEARCH_PARAMS,
    );
    setCustomerSearchParams(merged);
    fetchCustomers(merged);
  }, [router.query]);

  const fetchCustomers = (searchParams: CustomerSearchParams) => {
    const params = removeNullParams(searchParams);
    httpClient
      .get<ResponseCustomers>("/customers", {
        params: { search_params: { ...params } },
      })
      .then((response) => {
        if (response.data.customers) {
          setCustomers(response.data.customers);
          const newPageData = {
            totalPages: response.data.total_pages,
            currentPage: response.data.current_page,
            all: response.data.count,
          };
          setCustomersPageData(newPageData);
        } else {
          ErrorToast("該当するデータがありません");
          setCustomers([]);
          setCustomersPageData({
            totalPages: 1,
            currentPage: 1,
            all: 0,
          });
        }
      });
  };

  const resetSearchParams = () => {
    setCustomerSearchParams(DEFAULT_CUSTOMER_SEARCH_PARAMS);
    pushSearchParamsToUrl(router, DEFAULT_CUSTOMER_SEARCH_PARAMS);
  };

  return (
    <div id="contents">
      <section>
        <div className="headSCT">
          <div className="cont">
            <h1>
              <FontAwesomeIcon icon={faClipboardList} />
              利用者一覧
            </h1>
            <ul className="button">
              <li>
                <Link href="/customers/new">
                  <FontAwesomeIcon icon={faClipboardCheck} />
                  利用者登録
                </Link>
              </li>
              {/* <li>
                <Link href="/users/reports">
                  <FontAwesomeIcon icon={faHistory} />
                  利用者履歴
                </Link>
              </li>
              <li>
                <Link href="/users/relationships">
                  <FontAwesomeIcon icon={faExclamationTriangle} />
                  乗り合わせ設定
                </Link>
              </li> */}
            </ul>
            {officeName && (
              <div className="officeNameDisplay">{officeName}</div>
            )}
          </div>
        </div>
      </section>

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
                    name="customer_id_or_kana"
                    label="利用者"
                    type="search"
                    labelClassName="keyword"
                    setState={setCustomerSearchParams}
                    value={customerSearchParams.customer_id_or_kana}
                    placeholder="利用者番号またはカナ"
                  />
                </fieldset>
                <fieldset>
                  <span>利用パターン：</span>
                  <CheckboxField
                    label="月"
                    checked={customerSearchParams.monday ?? false}
                    falseValue={null}
                    name="monday"
                    setState={setCustomerSearchParams}
                  />
                  <CheckboxField
                    label="火"
                    checked={customerSearchParams.tuesday ?? false}
                    falseValue={null}
                    name="tuesday"
                    setState={setCustomerSearchParams}
                  />
                  <CheckboxField
                    label="水"
                    checked={customerSearchParams.wednesday ?? false}
                    falseValue={null}
                    name="wednesday"
                    setState={setCustomerSearchParams}
                  />
                  <CheckboxField
                    label="木"
                    checked={customerSearchParams.thursday ?? false}
                    falseValue={null}
                    name="thursday"
                    setState={setCustomerSearchParams}
                  />
                  <CheckboxField
                    label="金"
                    checked={customerSearchParams.friday ?? false}
                    falseValue={null}
                    name="friday"
                    setState={setCustomerSearchParams}
                  />
                  <CheckboxField
                    label="土"
                    checked={customerSearchParams.saturday ?? false}
                    falseValue={null}
                    name="saturday"
                    setState={setCustomerSearchParams}
                  />
                  <CheckboxField
                    label="日"
                    checked={customerSearchParams.sunday ?? false}
                    falseValue={null}
                    name="sunday"
                    setState={setCustomerSearchParams}
                  />
                </fieldset>
                <fieldset>
                  <SelectField
                    name="contract_status"
                    label="契約識別："
                    options={status}
                    value={customerSearchParams.contract_status}
                    setState={setCustomerSearchParams}
                  />
                  <SelectField
                    name="stopped_at"
                    label="休止日："
                    options={stoppedAtOptions}
                    value={customerSearchParams.stopped_at}
                    setState={setCustomerSearchParams}
                  />
                </fieldset>
              </div>
            </div>

            <div className="sort">
              <div className="submitbox">
                <button
                  onClick={() =>
                    pushSearchParamsToUrl(router, customerSearchParams)
                  }
                  type="button"
                  aria-label="検索"
                >
                  <FontAwesomeIcon icon={faSearch} />
                  検索
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="userSCT">
          <div className="cont">
            <DataTable
              columns={useCustomerTableColumns()}
              data={customers}
              onRowClick={(customer) =>
                router.push(`/customers/${customer.id}/edit`)
              }
            />
            <div
              className="tablefoot"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <label className="select" style={{ marginRight: 8 }}>
                  <span>表示件数：</span>
                  <select
                    id="perPageSelect"
                    value={customerSearchParams.per}
                    onChange={(e) => {
                      const per = Number(e.target.value);
                      setCustomerSearchParams((prev) => {
                        const newParams = { ...prev, per, page: 1 };
                        pushSearchParamsToUrl(router, newParams);
                        return newParams;
                      });
                    }}
                    style={{ marginRight: 16 }}
                  >
                    {DEFAULT_PER_PAGE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <Pagenation
                totalPages={customersPageData.totalPages}
                currentPage={customersPageData.currentPage}
                all={customersPageData.all}
                setState={(updater: any) =>
                  setCustomerSearchParams((prev) => {
                    const next =
                      typeof updater === "function" ? updater(prev) : updater;
                    pushSearchParamsToUrl(router, next);
                    return next;
                  })
                }
                // fetchは URL 変更トリガー側の useEffect で行うため no-op
                fetchFunc={() => {}}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default UsersPage;
