export type DashboardDriver = {
  id: number;
  name: string;
  can_driver: boolean;
  driver_type: string;
};

export type DashboardCar = {
  id: number;
  name: string;
  number: string;
  max_seat: number;
  max_wc_seat: number;
  status: string;
};

export type DashboardCustomer = {
  id: number;
  soge_type: string;
  name: string;
  address: string;
  schedule_time: string;
  start_time: string;
  wc: boolean;
  walker: number;
  car_restriction: number;
};

export type DashboardSchedule = {
  id: number;
  driver_id: number;
  car_id: number;
  car_name: string;
  driver_name: string;
  start_time: number;
  duration: number;
  type: "pick_up" | "drop_off";
  customers: DashboardCustomer[];
};

export type DashboardResponse = {
  drivers: DashboardDriver[];
  cars: DashboardCar[];
  schedules: DashboardSchedule[];
};
