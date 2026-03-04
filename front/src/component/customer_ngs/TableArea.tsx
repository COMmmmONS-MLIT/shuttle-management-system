import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import InputField from "@/component/FormControls/InputField";
import CustomerNgTableList from "@/component/customer_ngs/TableList";
import HttpClient from "@/adapter/HttpClient";
import Pagenation from "@/component/Widgets/pagenation";

// Types
import { CustomerNg, CustomerNgSearchParams } from "@/types/customerNg";
import { CustomerNgsResponse } from "@/types/ApiResponse/customerNg";
import { PageData } from "@/types/page";
import { DEFAULT_PER_PAGE_OPTIONS } from "@/types/dataTable";

//font awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faUndoAlt } from "@fortawesome/free-solid-svg-icons";

type Props = {
  setModal: React.Dispatch<React.SetStateAction<string | null>>;
  onEdit: (data: CustomerNg) => void;
  reloadKey: number;
};

const DEFAULT_PER =
  (DEFAULT_PER_PAGE_OPTIONS[0]?.value as number | undefined) || 10;

const CustomerNgTableArea = ({ onEdit, reloadKey }: Props) => {
  const router = useRouter();
  const [customerNgs, setCustomerNgs] = useState<CustomerNg[]>([]);
  const [searchParams, setSearchParams] = useState<CustomerNgSearchParams>({
    customer_a_cd_or_name: "",
    customer_b_cd_or_name: "",
    order: "",
    page: 1,
    per: DEFAULT_PER,
  });
  const [customerNgPageData, setCustomerNgPageData] = useState<PageData>({
    totalPages: 1,
    currentPage: 1,
    all: 0,
  });
  const httpClient = new HttpClient();

  const buildParamsFromQuery = (query: any): CustomerNgSearchParams => {
    const {
      customer_a_cd_or_name,
      customer_b_cd_or_name,
      per,
      page,
      order,
    } = query;

    return {
      customer_a_cd_or_name:
        typeof customer_a_cd_or_name === "string" ? customer_a_cd_or_name : "",
      customer_b_cd_or_name:
        typeof customer_b_cd_or_name === "string" ? customer_b_cd_or_name : "",
      order: typeof order === "string" ? order : "",
      per:
        typeof per === "string" && !Number.isNaN(Number(per))
          ? Number(per)
          : DEFAULT_PER,
      page:
        typeof page === "string" && !Number.isNaN(Number(page))
          ? Number(page)
          : 1,
    };
  };

  const syncQueryWithParams = (params: CustomerNgSearchParams) => {
    const query: Record<string, string> = {};

    if (params.customer_a_cd_or_name) {
      query.customer_a_cd_or_name = params.customer_a_cd_or_name;
    }
    if (params.customer_b_cd_or_name) {
      query.customer_b_cd_or_name = params.customer_b_cd_or_name;
    }
    if (params.order) {
      query.order = params.order;
    }
    if (params.per) {
      query.per = String(params.per);
    }
    if (params.page) {
      query.page = String(params.page);
    }

    router.push(
      {
        pathname: router.pathname,
        query,
      },
      undefined,
      { shallow: true }
    );
  };

  const fetchCustomerNgs = (params: CustomerNgSearchParams) => {
    httpClient
      .get<CustomerNgsResponse>("/customer_ngs", {
        params: { search_params: params },
      })
      .then((res) => {
        if (res.data.customer_ngs) {
          setCustomerNgs(res.data.customer_ngs);
          const newPageData = {
            totalPages: res.data.total_pages || 1,
            currentPage: res.data.current_page || 1,
            all: res.data.count || 0,
          };
          setCustomerNgPageData(newPageData);
        } else {
          setCustomerNgs([]);
          setCustomerNgPageData({
            totalPages: 1,
            currentPage: 1,
            all: 0,
          });
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // クエリパラメータ・reloadKey の変更に合わせて一覧を取得
  useEffect(() => {
    if (!router.isReady) return;

    const paramsFromQuery = buildParamsFromQuery(router.query);
    setSearchParams(paramsFromQuery);
    fetchCustomerNgs(paramsFromQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, router.query, reloadKey]);

  const search = () => {
    const newParams: CustomerNgSearchParams = {
      ...searchParams,
      page: 1,
    };
    setSearchParams(newParams);
    syncQueryWithParams(newParams);
  };

  const resetSearchParams = () => {
    const defaultParams: CustomerNgSearchParams = {
      customer_a_cd_or_name: "",
      customer_b_cd_or_name: "",
      order: "",
      per: DEFAULT_PER,
      page: 1,
    };
    setSearchParams(defaultParams);
    syncQueryWithParams(defaultParams);
  };

  return (
    <section>
      <div className="sortSCT">
        <div className="cont">
          <div className="head">
            <h2>
              <FontAwesomeIcon icon={faSearch} />
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
                  name="customer_a_cd_or_name"
                  label="対象者A:"
                  type="search"
                  labelClassName="keyword"
                  placeholder="利用者番号またはカナ"
                  setState={setSearchParams}
                  value={searchParams.customer_a_cd_or_name}
                />
                <InputField
                  name="customer_b_cd_or_name"
                  label="対象者B:"
                  type="search"
                  labelClassName="keyword"
                  placeholder="利用者番号またはカナ"
                  setState={setSearchParams}
                  value={searchParams.customer_b_cd_or_name}
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

      <div className="userSCT">
        <div className="cont">
          <CustomerNgTableList customerNgs={customerNgs} onEdit={onEdit} />
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
                  value={searchParams.per}
                  onChange={(e) => {
                    const per = Number(e.target.value);
                    setSearchParams((prev) => {
                      const newParams: CustomerNgSearchParams = {
                        ...prev,
                        per,
                        page: 1,
                      };
                      syncQueryWithParams(newParams);
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
              totalPages={customerNgPageData.totalPages}
              currentPage={customerNgPageData.currentPage}
              all={customerNgPageData.all}
              setState={setSearchParams}
              fetchFunc={(params: CustomerNgSearchParams) => {
                syncQueryWithParams(params);
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default CustomerNgTableArea;
