import HttpClient from "@/adapter/HttpClient";

// types
import { VisitingsCustomerSearchParams } from "@/types/visitingsCustomer";
import { ResponseVisitingsCustomerPairs } from "@/types/ApiResponse/visitingsCustomer";

const getEducationVisitingsCustomers = async (
  params: VisitingsCustomerSearchParams
) => {
  const httpClient = new HttpClient();
  const response = await httpClient.get<ResponseVisitingsCustomerPairs>(
    "/education/visitings_customers",
    { params: { search_params: params } }
  );
  return response.data;
};

export default getEducationVisitingsCustomers;
