import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import InputField from "@/component/FormControls/InputField";
import SelectField from "@/component/FormControls/SelectField";
import Pagenation from "@/component/Widgets/pagenation";
import RemoveEmptyParams from "@/component/Widgets/RemoveEmptyParams";
import DataTable from "@/config/tables/DataTable";
import { carTableColumns } from "@/config/tables/car/TableConfig";
import HttpClient from "@/adapter/HttpClient";
import {
  parseQueryToParams,
  pushSearchParamsToUrl,
} from "@/component/Widgets/SearchParamsSync";

// font awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClipboardList,
  faClipboardCheck,
  faFilter,
  faUndoAlt,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";

// types
import { Car, CarSearchParams } from "@/types/car";
import { CarPattern } from "@/types/carPattern";
import { ResponseCarsData } from "@/types/ApiResponse/car";
import { ResponseCarPatterns } from "@/types/ApiResponse/carPattern";
import { PageData } from "@/types/page";
import { DEFAULT_PER_PAGE_OPTIONS } from "@/types/dataTable";

// context
import { useUser } from "@/contexts/UserContext";

const DEFAULT_CAR_SEARCH_PARAMS: CarSearchParams = {
  per: 10,
  page: 1,
  number: "",
  name: "",
  car_pattern_name: "",
  order: "",
};

const CarsPage = () => {
  const router = useRouter();
  const httpClient = new HttpClient();
  const { officeName } = useUser();
  const [cars, setCars] = useState<Car[]>([]);
  const [carPatterns, setCarPatterns] = useState<CarPattern[]>([]);
  const [CarSearchParams, setCarSearchParams] = useState<CarSearchParams>(
    DEFAULT_CAR_SEARCH_PARAMS
  );
  const [PageData, setPageData] = useState<PageData>({
    totalPages: 1,
    currentPage: 1,
    all: 0,
  });

  useEffect(() => {
    const merged = parseQueryToParams<CarSearchParams>(
      router.query,
      DEFAULT_CAR_SEARCH_PARAMS
    );
    setCarSearchParams(merged);
    fetchCars(merged);
  }, [router.query]);

  useEffect(() => {
    fetchCarPatterns();
  }, []);

  const fetchCars = (searchParams: CarSearchParams) => {
    const url = "/cars";
    const data = RemoveEmptyParams(searchParams);
    const params = {
      params: {
        search_params: data,
      },
    };
    httpClient.get<ResponseCarsData>(url, params).then((response) => {
      setCars(response.data.cars);
      const newPageData = {
        totalPages: response.data.total_pages,
        currentPage: response.data.current_page,
        all: response.data.count,
      };
      setPageData(newPageData);
    });
  };

  const fetchCarPatterns = () => {
    const url = "/car_patterns";
    httpClient
      .get<ResponseCarPatterns>(url)
      .then((response) => {
        setCarPatterns(response.data.car_patterns);
      });
  };

  const resetSearchParams = () => {
    setCarSearchParams(DEFAULT_CAR_SEARCH_PARAMS);
    pushSearchParamsToUrl(router, DEFAULT_CAR_SEARCH_PARAMS);
  };

  const carPatternOptions = () => {
    const options = carPatterns.map((carPattern) => ({
      label: carPattern.name,
      value: carPattern.name,
    }));
    options.unshift({ label: "-----", value: "" });
    return options;
  };

  return (
    <div id="contents">
      <section>
        <div className="headSCT">
          <div className="cont">
            <h1>
              <FontAwesomeIcon icon={faClipboardList} />
              車両一覧
            </h1>
            <ul className="button">
              <li>
                <Link href="/cars/new">
                  <FontAwesomeIcon icon={faClipboardCheck} />
                  車両登録
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
          </div>
          <div className="sort">
            <div className="searchbox">
              <fieldset>
                <InputField
                  name="number"
                  label="車両番号："
                  type="search"
                  labelClassName="keyword"
                  setState={setCarSearchParams}
                  value={CarSearchParams.number}
                />
                <InputField
                  name="name"
                  label="車両名："
                  type="search"
                  labelClassName="keyword"
                  setState={setCarSearchParams}
                  value={CarSearchParams.name}
                />
                <SelectField
                  name="car_pattern_name"
                  label="車両パターン名："
                  options={carPatternOptions()}
                  setState={setCarSearchParams}
                  value={CarSearchParams.car_pattern_name}
                />
              </fieldset>
            </div>
          </div>

          <div className="sort">
            <div className="submitbox">
              <button
                type="button"
                onClick={() => pushSearchParamsToUrl(router, CarSearchParams)}
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
              columns={carTableColumns}
              data={cars}
              onRowClick={(car) => router.push(`/cars/${car.id}/edit`)}
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
                    value={CarSearchParams.per}
                    onChange={(e) => {
                      const per = Number(e.target.value);
                      setCarSearchParams((prev) => {
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
                totalPages={PageData.totalPages}
                currentPage={PageData.currentPage}
                all={PageData.all}
                setState={(updater: any) =>
                  setCarSearchParams((prev) => {
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

export default CarsPage;
