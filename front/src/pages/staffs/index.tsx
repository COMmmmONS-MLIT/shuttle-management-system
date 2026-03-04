import React, { useState, useEffect } from "react";
import Link from "next/link";
import Pagenation from "@/component/Widgets/pagenation";
import InputField from "@/component/FormControls/InputField";
import SelectField from "@/component/FormControls/SelectField";
import DataTable from "@/config/tables/DataTable";
import { staffTableColumns } from "@/config/tables/staff/TableConfig";
import HttpClient from "@/adapter/HttpClient";
import removeNullParams from "@/component/Widgets/RemoveEmptyParams";
import { ErrorToast } from "@/component/ReactHotToast/ToastMessage";
import { useRouter } from "next/router";
import {
  parseQueryToParams,
  pushSearchParamsToUrl,
} from "@/component/Widgets/SearchParamsSync";

// types
import { Staffs, StaffSearchParams } from "@/types/staff";
import { ResponseStaffsData } from "@/types/ApiResponse/staff";
import { PageData } from "@/types/page";
import { DEFAULT_PER_PAGE_OPTIONS } from "@/types/dataTable";

// context
import { useUser } from "@/contexts/UserContext";

// font awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClipboardList,
  faClipboardCheck,
  faSearch,
  faFilter,
  faUndoAlt,
} from "@fortawesome/free-solid-svg-icons";

const canDriverOptions = [
  { label: "-----", value: "" },
  { label: "可能", value: "true" },
  { label: "不可", value: "false" },
];

const canHelperOptions = [
  { label: "-----", value: "" },
  { label: "可能", value: "true" },
  { label: "不可", value: "false" },
];

const DEFAULT_STAFF_SEARCH_PARAMS: StaffSearchParams = {
  per: 10,
  page: 1,
  order: "",
  cd_or_kana: "",
  can_driver: "",
  can_helper: "",
};

const StaffsPage = () => {
  const router = useRouter();
  const httpClient = new HttpClient();
  const { officeName } = useUser();
  const [staffs, setStaffs] = useState<Staffs[]>([]);
  const [staffSearchParams, setStaffSearchParams] = useState<StaffSearchParams>(
    DEFAULT_STAFF_SEARCH_PARAMS,
  );
  const [staffPageData, setStaffPageData] = useState<PageData>({
    totalPages: 1,
    currentPage: 1,
    all: 0,
  });

  useEffect(() => {
    const merged = parseQueryToParams<StaffSearchParams>(
      router.query,
      DEFAULT_STAFF_SEARCH_PARAMS,
    );
    setStaffSearchParams(merged);
    fetchStaffs(merged);
  }, [router.query]);

  const fetchStaffs = (searchParams: StaffSearchParams) => {
    const params = removeNullParams(searchParams);
    httpClient
      .get<ResponseStaffsData>("/staffs", {
        params: { search_params: { ...params } },
      })
      .then((response) => {
        if (response.data.staffs) {
          setStaffs(response.data.staffs);
          const newPageData = {
            totalPages: response.data.total_pages,
            currentPage: response.data.current_page,
            all: response.data.count,
          };
          setStaffPageData(newPageData);
        } else {
          ErrorToast("該当するデータがありません");
          setStaffs([]);
          setStaffPageData({
            totalPages: 1,
            currentPage: 1,
            all: 0,
          });
        }
      });
  };

  const resetSearchParams = () => {
    setStaffSearchParams(DEFAULT_STAFF_SEARCH_PARAMS);
    pushSearchParamsToUrl(router, DEFAULT_STAFF_SEARCH_PARAMS);
  };

  return (
    <div id="contents">
      <section>
        <div className="headSCT">
          <div className="cont">
            <h1>
              <FontAwesomeIcon icon={faClipboardList} />
              職員一覧
            </h1>
            <ul className="button">
              <li>
                <Link href="/staffs/new">
                  <FontAwesomeIcon icon={faClipboardCheck} />
                  職員登録
                </Link>
              </li>
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
          </div>

          <div className="sort">
            <div className="searchbox">
              <fieldset>
                <InputField
                  name="cd_or_kana"
                  label="職員ID："
                  type="search"
                  labelClassName="keyword"
                  setState={setStaffSearchParams}
                  value={staffSearchParams.cd_or_kana}
                  placeholder="職員IDまたはカナ"
                />
                <SelectField
                  label="運転可能："
                  options={canDriverOptions}
                  value={staffSearchParams.can_driver}
                  name="can_driver"
                  setState={setStaffSearchParams}
                />
                <SelectField
                  label="添乗可能："
                  options={canHelperOptions}
                  value={staffSearchParams.can_helper}
                  name="can_helper"
                  setState={setStaffSearchParams}
                />
              </fieldset>
            </div>
          </div>

          <div className="sort">
            <div className="submitbox">
              <button
                onClick={() => pushSearchParamsToUrl(router, staffSearchParams)}
                type="button"
                aria-label="検索"
              >
                <FontAwesomeIcon icon={faSearch} />
                検索
              </button>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="userSCT">
          <div className="cont">
            <DataTable
              columns={staffTableColumns}
              data={staffs}
              onRowClick={(staff) => router.push(`/staffs/${staff.id}/edit`)}
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
                    value={staffSearchParams.per}
                    onChange={(e) => {
                      const per = Number(e.target.value);
                      setStaffSearchParams((prev) => {
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
                totalPages={staffPageData.totalPages}
                currentPage={staffPageData.currentPage}
                all={staffPageData.all}
                setState={(updater: any) =>
                  setStaffSearchParams((prev) => {
                    const next =
                      typeof updater === "function" ? updater(prev) : updater;
                    pushSearchParamsToUrl(router, next);
                    return next;
                  })
                }
                fetchFunc={() => {}}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default StaffsPage;
