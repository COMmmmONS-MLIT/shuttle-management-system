import HttpClient from "@/adapter/HttpClient";
import { RoutePoint } from "@/types/soge";

const postNewData = async (
  date: string,
  car_id: number,
  bin_order: number,
  customers: RoutePoint[] = []
) => {
  const httpClient = new HttpClient();
  const customers_params = customers.map((customer, index) => ({
    id: customer.id,
    order: index + 1,
  }));
  const params = {
    new_data: {
      date: date,
      car_id: car_id,
      bin_order: bin_order,
    },
    customers: customers_params,
  };
  const res = await httpClient.post<{ id: number }>(
    "/visitings/new_data",
    params
  );
  return res.data;
};

export default postNewData;
