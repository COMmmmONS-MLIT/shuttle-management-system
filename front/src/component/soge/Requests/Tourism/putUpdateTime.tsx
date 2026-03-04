import { TourismRoutePoint } from "@/types/soge";
import HttpClient from "@/adapter/HttpClient";

const putUpdateTime = async (
  id: number | undefined,
  newRoutePoints: TourismRoutePoint[],
  customersList: TourismRoutePoint[],
  adjustmentTime?: number
) => {
  if (!id) return;
  const httpClient = new HttpClient();
  const url = `/tourism/visitings/${id}/update_time`;
  const customers = newRoutePoints
    .filter((customer) => !customer.arrival)
    .map((customer, index) => ({
      id: customer.id,
      order: index + 1,
      soge_type: customer.soge_type,
      point_id: customer.point_id,
    }));

  const customerIds = customersList.map((customer) =>
    customer.point_type === "VisitingsCustomer" ? customer.id : undefined
  );
  const params = {
    route_points: customers,
    adjustment_time: adjustmentTime,
    customer_ids: customerIds,
  };
  await httpClient.put(url, params);
};

export default putUpdateTime;
