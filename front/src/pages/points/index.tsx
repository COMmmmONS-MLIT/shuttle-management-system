import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import HttpClient from "@/adapter/HttpClient";
import Pagenation from "@/component/Widgets/pagenation";
import InputField from "@/component/FormControls/InputField";
import SelectField from "@/component/FormControls/SelectField";
import removeNullParams from "@/component/Widgets/RemoveEmptyParams";
import DataTable from "@/config/tables/DataTable";
import { pointTableColumns } from "@/config/tables/point/TableConfig";
import { ErrorToast } from "@/component/ReactHotToast/ToastMessage";
import {
  parseQueryToParams,
  pushSearchParamsToUrl,
} from "@/component/Widgets/SearchParamsSync";

// types
import { PageData } from "@/types/page";
import {
  PointFormData,
  PointApiResponse,
  PointSearchParams,
} from "@/types/point";
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

const carLimitOptions = [
  { label: "-----", value: "" },
  { label: "車両制限なし", value: 0 },
  { label: "軽のみ", value: 1 },
  { label: "軽の助手席", value: 2 },
  { label: "軽のゲート不可", value: 3 },
  { label: "ゲートのみ", value: 4 },
  { label: "ハイエース不可", value: 5 },
  { label: "軽かゲート", value: 6 },
  { label: "軽車両", value: 7 },
];

const DEFAULT_POINT_SEARCH_PARAMS: PointSearchParams = {
  page: 1,
  per: 10,
  order: "",
  address_label: "",
  address: "",
  car_restriction_id: "",
};

const PointsIndex = () => {
  const router = useRouter();
  const httpClient = new HttpClient();
  const { officeName } = useUser();
  const [points, setPoints] = useState<PointFormData[]>([]);
  const [pointSearchParams, setPointSearchParams] =
    useState<PointSearchParams>(DEFAULT_POINT_SEARCH_PARAMS);
  const [pointPageData, setPointPageData] = useState<PageData>({
    totalPages: 1,
    currentPage: 1,
    all: 0,
  });

  useEffect(() => {
    const merged = parseQueryToParams<PointSearchParams>(
      router.query,
      DEFAULT_POINT_SEARCH_PARAMS
    );
    setPointSearchParams(merged);
    fetchPoints(merged);
  }, [router.query]);

  const fetchPoints = (searchParams: PointSearchParams) => {
    const params = removeNullParams(searchParams);
    httpClient
      .get<PointApiResponse>("/points", {
        params: { search_params: { ...params } },
      })
      .then((response) => {
        if (response.data.points) {
          setPoints(response.data.points);
          const newPageData = {
            totalPages: response.data.total_pages,
            currentPage: response.data.current_page,
            all: response.data.count,
          };
          setPointPageData(newPageData);
        } else {
          ErrorToast("該当するデータがありません");
          setPoints([]);
          setPointPageData({
            totalPages: 1,
            currentPage: 1,
            all: 0,
          });
        }
      })
      .catch((error) => {
        ErrorToast("地点マスタの取得に失敗しました");
        console.error(error);
      });
  };

  const resetSearchParams = () => {
    setPointSearchParams(DEFAULT_POINT_SEARCH_PARAMS);
    pushSearchParamsToUrl(router, DEFAULT_POINT_SEARCH_PARAMS);
  };

  return (
    <div id="contents">
      <section>
        <div className="headSCT">
          <div className="cont">
            <h1>
              <FontAwesomeIcon icon={faClipboardList} />
              地点マスタ
            </h1>
            <ul className="button">
              <li>
                <Link href="/points/new">
                  <FontAwesomeIcon icon={faClipboardCheck} />
                  地点登録
                </Link>
              </li>
            </ul>
            {officeName && (
              <div className="officeNameDisplay">
                {officeName}
              </div>
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
                    name="address_label"
                    label="地点名"
                    type="search"
                    labelClassName="keyword"
                    setState={setPointSearchParams}
                    value={pointSearchParams.address_label}
                    placeholder="地点名"
                  />
                  <InputField
                    name="address"
                    label="住所"
                    type="search"
                    labelClassName="keyword"
                    setState={setPointSearchParams}
                    value={pointSearchParams.address}
                    placeholder="住所"
                  />
                  <SelectField
                    name="car_restriction_id"
                    label="車両制限："
                    options={carLimitOptions}
                    value={pointSearchParams.car_restriction_id}
                    setState={setPointSearchParams}
                  />
                </fieldset>
              </div>
            </div>

            <div className="sort">
              <div className="submitbox">
                <button
                  onClick={() =>
                    pushSearchParamsToUrl(router, pointSearchParams)
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
              columns={pointTableColumns}
              data={points}
              onRowClick={(point) => router.push(`/points/${point.id}/edit`)}
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
                    value={pointSearchParams.per}
                    onChange={(e) => {
                      const per = Number(e.target.value);
                      setPointSearchParams((prev) => {
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
                totalPages={pointPageData.totalPages}
                currentPage={pointPageData.currentPage}
                all={pointPageData.all}
                setState={(updater: any) =>
                  setPointSearchParams((prev) => {
                    const next =
                      typeof updater === "function"
                        ? updater(prev)
                        : updater;
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

export default PointsIndex;
