import HttpClient from "@/adapter/HttpClient";

const putUpdateStaffs = async (
  id: number | undefined,
  driverId: number | undefined,
  tenjoId: number | undefined
) => {
  if (!id) return;
  const httpClient = new HttpClient();
  const url = `/visitings/${id}/update_staffs`;
  const params = {
    staffs_update: {
      driver_id: driverId,
      tenjo_id: tenjoId,
    },
  };
  await httpClient.put(url, params);
};

export default putUpdateStaffs;
