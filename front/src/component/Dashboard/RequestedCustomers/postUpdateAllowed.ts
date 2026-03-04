import HttpClient from "@/adapter/HttpClient";
import {
  SuccessToast,
  ErrorToast,
} from "@/component/ReactHotToast/ToastMessage";

export const postUpdateAllowed = async (
  requestedCustomerIds: number[],
  onSuccess?: () => void
) => {
  if (requestedCustomerIds.length === 0) {
    return;
  }

  const httpClient = new HttpClient();

  try {
    const url = `/requested_customers/update_allowed`;
    const response = await httpClient.post<{ message: string }>(url, {
      requested_customer_ids: requestedCustomerIds,
    });

    SuccessToast(response.data.message);
    onSuccess?.();
  } catch (err: any) {
    if (err.response?.data?.full_messages) {
      ErrorToast(err.response.data.full_messages);
    }
  }
};

