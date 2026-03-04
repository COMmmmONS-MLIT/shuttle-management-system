import HttpClient from "@/adapter/HttpClient";
import { ResponseCanDriver } from "@/types/ApiResponse/visiting";
const getCanDriver = async (visitingId: number) => {
  const httpClient = new HttpClient();
  const url = `/visitings/${visitingId}/can_driving_staff`;
  const res = await httpClient.get<ResponseCanDriver>(url);
  return res.data;
};

export default getCanDriver;
