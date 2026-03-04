import HttpClient from "@/adapter/HttpClient";
import { ResponseOptimalRoute } from "@/types/ApiResponse/visiting";

const getDistanceRoute = async (visitingId: number) => {
  const httpClient = new HttpClient();
  const url = `/visitings/${visitingId}/distance_route`;

  const res = await httpClient.get<ResponseOptimalRoute>(url);
  return res.data.visiting;
};

export default getDistanceRoute;
