import React, { useState, useEffect, useCallback } from "react";
import HttpClient from "@/adapter/HttpClient";
import SogeType from "@/component/Widgets/SogeType";
import Wheelchair from "@/component/Widgets/Wheelchair";
import RequestedCustomerModal from "./Modal";
import RequestingCustomersTable from "@/component/RequestingCustomers/RequestingCustomersTable";
import CheckboxField from "@/component/FormControls/CheckboxField";
import { useBulkSelection } from "@/component/Visiting/hooks/useBulkSelection";
import { postUpdateAllowed } from "./postUpdateAllowed";
import moment from "moment";
import { ErrorToast } from "@/component/ReactHotToast/ToastMessage";

// context
import { useUser } from "@/contexts/UserContext";

// font awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCar, faWheelchair } from "@fortawesome/free-solid-svg-icons";

// types
import RequestedCustomer from "@/types/requestedCustomer";
import RequestedCustomerResponse from "@/types/ApiResponse/requestedCustomer";

type Props = {
  date: string;
  refreshKey?: number;
  onRequestSuccess?: () => void;
};

const RequestedCustomers = ({ date, refreshKey, onRequestSuccess }: Props) => {
  const httpClient = new HttpClient();
  const { category } = useUser();
  const startDate = moment(date).format("MM/DD");
  const endDate = moment(date).add(1, "month").format("MM/DD");
  const [requestdCustomers, setRequestdCustomers] = useState<
    RequestedCustomer[]
  >([]);
  const [allowedRequestdCustomers, setAllowedRequestdCustomers] = useState<
    RequestedCustomer[]
  >([]);
  const [requestingCustomers, setRequestingCustomers] = useState<
    RequestedCustomer[]
  >([]);

  const [selectedCustomer, setSelectedCustomer] =
    useState<RequestedCustomer | null>(null);

  const {
    selectedItems: selectedRequestedCustomers,
    handleSelectAll: handleSelectAllRequested,
    handleIndividualCheckbox: handleIndividualRequestedCheckbox,
    clearSelection,
  } = useBulkSelection({
    items: requestdCustomers,
    isSelectable: (customer) => !customer.allowed,
  });


  useEffect(() => {
    fetchRequestdCustomers(date);
  }, [category, date, refreshKey]);

  const fetchRequestdCustomers = async (date: string) => {
    const url = "/requested_customers";
    const params = {
      params: {
        date: date,
      },
    };
    httpClient
      .get<RequestedCustomerResponse>(url, params)
      .then((res) => {
        setRequestdCustomers(res.data.requested_customers);
        setAllowedRequestdCustomers(res.data.allowed_requested_customers);
        setRequestingCustomers(res.data.requesting_customers);
      })
      .catch(() => {
        ErrorToast("送迎リクエストの取得に失敗しました");
      });
  };

  const textStyle = {
    fontSize: "16px",
    fontWeight: "bold",
  };

  const handleSelectCustomer = (customer: RequestedCustomer) => {
    setSelectedCustomer(customer);
  };


  const bulkApproveRequests = useCallback(async () => {
    if (selectedRequestedCustomers.size === 0) {
      return;
    }

    if (!confirm(`選択した${selectedRequestedCustomers.size}件の送迎リクエストを承認しますか？`)) {
      return;
    }

    const selectedCustomers = Array.from(selectedRequestedCustomers).map(index => requestdCustomers[index]);
    const requestedCustomerIds = selectedCustomers.map(customer => customer.id);

    await postUpdateAllowed(requestedCustomerIds, () => {
      clearSelection();
      fetchRequestdCustomers(date);
      onRequestSuccess?.();
    });
  }, [selectedRequestedCustomers, requestdCustomers, date, onRequestSuccess]);
  return (
    <section>
      {(requestdCustomers.length > 0 ||
        allowedRequestdCustomers.length > 0) && (
        <div className="visitSCT">
          <div className="cont">
            <div className="head">
              <h2>
                <FontAwesomeIcon icon={faCar} />
                送迎受託（{startDate} ~ {endDate}）
              </h2>
            </div>

            {requestdCustomers.length > 0 && (
              <div className="sort">
                <p style={textStyle}>承認待ち</p>
                <div className="viewport js-scroll">
                  <table className="userTable">
                    <thead>
                      <tr>
                        <th>送迎タイプ</th>
                        <th>日付</th>
                        <th>事業所名</th>
                        <th>住所</th>
                        <th>利用者名</th>
                        <th>利用者名カナ</th>
                        <th>乗車地点</th>
                        <th>降車地点</th>
                        <th>予定時間</th>
                        {category !== "tourism" && (
                          <>
                            <th>開始時間</th>
                            <th>
                              <FontAwesomeIcon icon={faWheelchair} />
                            </th>
                          </>
                        )}
                        <th>
                          {requestdCustomers.filter(c => !c.allowed).length > 0 && (
                            <div style={{ display: "flex", alignItems: "center" }}>
                              <CheckboxField
                                checked={selectedRequestedCustomers.size === requestdCustomers.filter(c => !c.allowed).length && requestdCustomers.filter(c => !c.allowed).length > 0}
                                setState={handleSelectAllRequested}
                              />
                              <button
                                style={{ fontSize: "12px", fontWeight: "bold" }}
                                onClick={bulkApproveRequests}
                                disabled={selectedRequestedCustomers.size === 0}
                              >
                                委託を承認
                              </button>
                            </div>
                          )}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {requestdCustomers.map((customer, index) => (
                        <tr
                          key={index}
                          onClick={() => handleSelectCustomer(customer)}
                        >
                          <td>{SogeType(customer.soge_type)}</td>
                          <td>{customer.date}</td>
                          <td>{customer.office_name}</td>
                          <td>{customer.address}</td>
                          <td>{customer.name}</td>
                          <td>{customer.name_kana}</td>
                          <td>{customer.departure_address}</td>
                          <td>{customer.arrival_address}</td>
                          <td>{customer.schedule_time}</td>
                          {category !== "tourism" && (
                            <>
                              <td>{customer.start_time}</td>
                              <td>{Wheelchair(customer.wc)}</td>
                            </>
                          )}
                          <td onClick={(e) => e.stopPropagation()}>
                            {!customer.allowed && (
                              <CheckboxField
                                checked={selectedRequestedCustomers.has(index)}
                                setState={(checked: boolean) => handleIndividualRequestedCheckbox(index, checked)}
                              />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {allowedRequestdCustomers.length > 0 && (
              <div className="sort">
                <p style={{ ...textStyle, marginTop: "20px" }}>承認済み</p>
                <div className="viewport js-scroll">
                  <table className="userTable">
                    <thead>
                      <tr>
                        <th>送迎タイプ</th>
                        <th>日付</th>
                        <th>事業所名</th>
                        <th>住所</th>
                        <th>利用者名</th>
                        <th>利用者名カナ</th>
                        <th>乗車地点</th>
                        <th>降車地点</th>
                        <th>予定時間</th>
                        {category !== "tourism" && (
                          <>
                            <th>開始時間</th>
                            <th>
                              <FontAwesomeIcon icon={faWheelchair} />
                            </th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {allowedRequestdCustomers.length > 0 &&
                        allowedRequestdCustomers.map((customer, index) => (
                          <tr
                            key={index}
                            onClick={() => handleSelectCustomer(customer)}
                          >
                            <td>{SogeType(customer.soge_type)}</td>
                            <td>{customer.date}</td>
                            <td>{customer.office_name}</td>
                            <td>{customer.address}</td>
                            <td>{customer.name}</td>
                            <td>{customer.name_kana}</td>
                            <td>{customer.departure_address}</td>
                            <td>{customer.arrival_address}</td>
                            <td>{customer.schedule_time}</td>
                            {category !== "tourism" && (
                              <>
                                <td>{customer.start_time}</td>
                                <td>{Wheelchair(customer.wc)}</td>
                              </>
                            )}
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <RequestingCustomersTable
        requestingCustomers={requestingCustomers}
        showCancelButton={true}
        showDateColumn={true}
        headerTitle={`送迎委託（${startDate} ~ ${endDate}）`}
        onCancelSuccess={() => {
          fetchRequestdCustomers(date);
          onRequestSuccess?.();
        }}
      />
      {selectedCustomer && (
        <RequestedCustomerModal
          requestedCustomer={selectedCustomer}
          setRequestedCustomer={setSelectedCustomer}
          onUpdate={() => {
            fetchRequestdCustomers(date);
            onRequestSuccess?.();
          }}
        />
      )}
    </section>
  );
};

export default RequestedCustomers;
