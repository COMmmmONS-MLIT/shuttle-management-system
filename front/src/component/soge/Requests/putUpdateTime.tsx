import { RoutePoint } from "@/types/soge";
import HttpClient from "@/adapter/HttpClient";

const putUpdateTime = async (
  id: number | undefined,
  newCustomers: RoutePoint[],
  adjustmentTime?: number,
  departureTime?: string
) => {
  if (!id) return;
  const httpClient = new HttpClient();
  const url = `/visitings/${id}/update_time`;
  const customers = newCustomers.map((customer, index) => ({
    id: customer.id,
    order: index + 1,
    point_type: customer.point_type,
  }));
  const params = {
    route_points: customers,
    adjustment_time: adjustmentTime,
    departure_time: departureTime,
  };
  await httpClient.put(url, params);
};

export default putUpdateTime;
