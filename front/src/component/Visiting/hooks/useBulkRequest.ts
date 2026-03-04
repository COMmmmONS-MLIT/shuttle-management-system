import { useState, useCallback } from "react";
import { useBulkSelection } from "./useBulkSelection";

type UseBulkRequestOptions<T> = {
  customers: T[];
  getCustomerId: (customer: T) => number | undefined;
  isSelectable?: (customer: T) => boolean;
  onRequestSuccess?: () => void;
  fetchVisitingsCustomers?: () => void;
};

export const useBulkRequest = <T,>({
  customers,
  getCustomerId,
  isSelectable,
  onRequestSuccess,
  fetchVisitingsCustomers,
}: UseBulkRequestOptions<T>) => {
  const [showRequestModal, setShowRequestModal] = useState<boolean>(false);

  const {
    selectedItems: selectedCustomers,
    handleSelectAll,
    handleIndividualCheckbox,
    clearSelection,
  } = useBulkSelection({
    items: customers,
    isSelectable,
  });

  const handleBulkRequest = useCallback(() => {
    if (selectedCustomers.size === 0) {
      return;
    }
    setShowRequestModal(true);
  }, [selectedCustomers.size]);

  const getSelectedCustomerIds = useCallback(() => {
    return Array.from(selectedCustomers)
      .map((index) => getCustomerId(customers[index]))
      .filter((id): id is number => id !== undefined);
  }, [selectedCustomers, customers, getCustomerId]);

  const handleRequestSuccess = useCallback(() => {
    clearSelection();
    setShowRequestModal(false);
    fetchVisitingsCustomers?.();
    onRequestSuccess?.();
  }, [clearSelection, fetchVisitingsCustomers, onRequestSuccess]);

  const handleCancel = useCallback(() => {
    setShowRequestModal(false);
  }, []);

  return {
    selectedCustomers,
    showRequestModal,
    handleSelectAll,
    handleIndividualCheckbox,
    handleBulkRequest,
    getSelectedCustomerIds,
    handleRequestSuccess,
    handleCancel,
  };
};

