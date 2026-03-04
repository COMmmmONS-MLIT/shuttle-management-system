import HttpClient from "@/adapter/HttpClient";
import {
  SuccessToast,
  ErrorToast,
} from "@/component/ReactHotToast/ToastMessage";

export const postApproveCancellation = async (
  requestedCustomerId: number,
  onSuccess?: () => void
) => {
  const httpClient = new HttpClient();

  try {
    const url = `/requested_customers/${requestedCustomerId}/approve_cancellation`;
    const response = await httpClient.post<{ message: string }>(url, {});

    SuccessToast(response.data.message);
    onSuccess?.();
  } catch (err: any) {
    if (err.response?.data?.full_messages) {
      ErrorToast(err.response.data.full_messages);
    } 
  }
};

