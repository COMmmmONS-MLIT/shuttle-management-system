import HttpClient from "@/adapter/HttpClient";
import { RoutePoint } from "@/types/soge";

const postNewData = async (
  date: string,
  car_id: number,
  bin_order: number,
  customers: RoutePoint[] = []
) => {
  const httpClient = new HttpClient();
  const customerIds = customers.map((customer) => customer.id);
  const params = {
    new_data: {
      date: date,
      car_id: car_id,
      bin_order: bin_order,
    },
    customer_ids: customerIds,
  };
  const res = await httpClient.post<{ id: number }>(
    "/tourism/visitings/new_data",
    params
  );
  return res.data;
};

export default postNewData;
