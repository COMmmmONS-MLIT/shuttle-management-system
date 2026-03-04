import React, { useMemo } from "react";

import InputField from "@/component/FormControls/InputField";
import EducationRequestVisitingsCustomer from "@/component/Visiting/EducationRequestVisitingsCustomer";
import DataTable from "@/config/tables/DataTable";
import { createEducationTableColumns } from "@/config/tables/visiting/TableConfig";
import { useBulkRequest } from "@/component/Visiting/hooks/useBulkRequest";
import { useUser } from "@/contexts/UserContext";

import {
  EducationVisitingsCustomer,
  VisitingsCustomerSearchParams,
} from "@/types/visitingsCustomer";

type Props = {
  searchParams: VisitingsCustomerSearchParams;
  setSearchParams: React.Dispatch<
    React.SetStateAction<VisitingsCustomerSearchParams>
  >;
  visitingsCustomers: EducationVisitingsCustomer[];
  handleEdit: (customer: EducationVisitingsCustomer) => void;
  fetchVisitingsCustomers: (params: VisitingsCustomerSearchParams) => void;
  dashboard?: boolean;
  onRequestSuccess?: () => void;
};

const EducationTableList = ({
  searchParams,
  setSearchParams,
  visitingsCustomers,
  handleEdit,
  fetchVisitingsCustomers,
  dashboard = false,
  onRequestSuccess,
}: Props) => {
  const { canRequest } = useUser();
  const {
    selectedCustomers,
    showRequestModal,
    handleSelectAll,
    handleIndividualCheckbox,
    handleBulkRequest,
    getSelectedCustomerIds,
    handleRequestSuccess,
    handleCancel,
  } = useBulkRequest({
    customers: visitingsCustomers,
    getCustomerId: (customer) => customer.id,
    isSelectable: (customer) =>
      !customer.is_requested && !!customer.can_request,
    onRequestSuccess,
    fetchVisitingsCustomers: () => fetchVisitingsCustomers(searchParams),
  });

  const columns = useMemo(
    () =>
      createEducationTableColumns(
        selectedCustomers,
        handleSelectAll,
        handleBulkRequest,
        handleIndividualCheckbox,
        canRequest,
      ),
    [selectedCustomers, visitingsCustomers, canRequest],
  );

  const handleSort = (sortKey: string, newOrder: string) => {
    setSearchParams((prev) => {
      const newParams = {
        ...prev,
        order: newOrder,
        page: 1,
      };
      fetchVisitingsCustomers(newParams);
      return newParams;
    });
  };

  return (
    <>
      {showRequestModal && (
        <section>
          <div className="modalSCT active">
            <div className="mask" onClick={handleCancel}></div>
            <div className="cont">
              <div className="close" onClick={handleCancel}></div>
              <div className="inner wide USER">
                <EducationRequestVisitingsCustomer
                  visitingsCustomerIds={getSelectedCustomerIds()}
                  onSuccess={handleRequestSuccess}
                  onCancel={handleCancel}
                />
              </div>
            </div>
          </div>
        </section>
      )}

      <div className="head">
        <div className="selectbox">
          <fieldset
            className="basic flex"
            style={{ display: "flex", alignItems: "center" }}
          >
            <InputField
              type="date"
              label="日付："
              labelClassName="date"
              name="start_date"
              value={searchParams.start_date || ""}
              setState={setSearchParams}
            />
            <span>〜</span>
            <InputField
              type="date"
              labelClassName="date"
              name="end_date"
              value={searchParams.end_date || ""}
              setState={setSearchParams}
            />
          </fieldset>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={visitingsCustomers}
        onRowClick={handleEdit}
      />
      <div
        className="tablefoot"
        style={{ display: "flex", alignItems: "center" }}
      >
        <span style={{ fontSize: "14px", color: "var(--color-set1-accent)" }}>
          全{visitingsCustomers.length}件
        </span>
      </div>
    </>
  );
};

export default EducationTableList;
