import HttpClient from "@/adapter/HttpClient";
import { ResponseOptimalRoute } from "@/types/ApiResponse/visiting";

const getOptimalRoute = async (visitingId: number) => {
  const httpClient = new HttpClient();
  const url = `/visitings/${visitingId}/optimal_route`;

  const res = await httpClient.get<ResponseOptimalRoute>(url);
  return res.data.visiting;
};

export default getOptimalRoute;
