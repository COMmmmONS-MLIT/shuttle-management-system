import HttpClient from "@/adapter/HttpClient";

// types
import { VisitingsCustomerSearchParams } from "@/types/visitingsCustomer";
import { ResponseVisitingsCustomerPairs } from "@/types/ApiResponse/visitingsCustomer";

const getVisitingsCustomers = async (params: VisitingsCustomerSearchParams) => {
  const httpClient = new HttpClient();
  const response = await httpClient.get<ResponseVisitingsCustomerPairs>(
    "/visitings_customers",
    { params: { search_params: params } }
  );
  return response.data;
};

export default getVisitingsCustomers;
