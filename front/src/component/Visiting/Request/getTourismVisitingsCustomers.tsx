import HttpClient from "@/adapter/HttpClient";

// types
import { VisitingsCustomerSearchParams } from "@/types/visitingsCustomer";
import { ResponseVisitingsCustomerPairs } from "@/types/ApiResponse/visitingsCustomer";

const getTourismVisitingsCustomers = async (
  params: VisitingsCustomerSearchParams
) => {
  const httpClient = new HttpClient();
  const response = await httpClient.get<ResponseVisitingsCustomerPairs>(
    "/tourism/visitings_customers",
    { params: { search_params: params } }
  );
  return response.data;
};

export default getTourismVisitingsCustomers;
