import React, { useMemo, useCallback } from "react";
import HttpClient from "@/adapter/HttpClient";
import DataTable from "@/config/tables/DataTable";
import { createRequestingCustomersTableColumns } from "@/config/tables/visiting/TableConfig";
import {
  SuccessToast,
  ErrorToast,
} from "@/component/ReactHotToast/ToastMessage";
import { useBulkSelection } from "@/component/Visiting/hooks/useBulkSelection";
import RequestedCustomer from "@/types/requestedCustomer";

// font awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCar } from "@fortawesome/free-solid-svg-icons";

type Props = {
  requestingCustomers: RequestedCustomer[];
  showCancelButton?: boolean;
  showDateColumn?: boolean;
  headerTitle?: string | React.ReactNode;
  onCancelSuccess?: () => void;
};

const RequestingCustomersTable = ({
  requestingCustomers,
  showCancelButton = false,
  showDateColumn = false,
  headerTitle = "送迎委託",
  onCancelSuccess,
}: Props) => {
  const httpClient = new HttpClient();

  const {
    selectedItems: selectedRequestingCustomers,
    handleSelectAll: handleSelectAllRequesting,
    handleIndividualCheckbox: handleIndividualRequestingCheckbox,
    clearSelection,
  } = useBulkSelection({
    items: requestingCustomers,
    isSelectable: (customer) => !customer.allowing_office_id,
  });

  const cancelRequests = useCallback(async () => {
    if (!confirm(`選択した${selectedRequestingCustomers.size}件の送迎リクエストを取消しますか？`)) {
      return;
    }

    const selectedCustomers = Array.from(selectedRequestingCustomers).map(index => requestingCustomers[index]);
    const customerIds = selectedCustomers.map(customer => customer.id);

    try {
      const url = `/requested_customers/cancel`;
      const response = await httpClient.post<{ message: string }>(url, { customer_ids: customerIds });

      SuccessToast(response.data.message);
      clearSelection();
      onCancelSuccess?.();
    } catch (err: any) {
      ErrorToast(err.response?.data?.error || "送迎リクエストの取消に失敗しました");
    }
  }, [selectedRequestingCustomers, requestingCustomers, onCancelSuccess]);

  const columns = useMemo(
    () => createRequestingCustomersTableColumns(
      selectedRequestingCustomers,
      handleSelectAllRequesting,
      cancelRequests,
      handleIndividualRequestingCheckbox,
      showCancelButton,
      showDateColumn,
      onCancelSuccess
    ),
    [showCancelButton, showDateColumn, selectedRequestingCustomers, requestingCustomers, handleSelectAllRequesting, cancelRequests, handleIndividualRequestingCheckbox, onCancelSuccess]
  );

  if (requestingCustomers.length === 0) {
    return null;
  }

  return (
    <div className="visitSCT">
      <div className="cont">
        <div className="head">
          <h2>
            <FontAwesomeIcon icon={faCar} />
            {headerTitle || "送迎委託"}
          </h2>
        </div>

        <div className="sort">
          <DataTable
            columns={columns}
            data={requestingCustomers}
          />
        </div>
      </div>
    </div>
  );
};

export default RequestingCustomersTable;

