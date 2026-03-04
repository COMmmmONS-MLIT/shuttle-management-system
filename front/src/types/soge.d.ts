import { BasePoint } from "./basePoint";

export type RoutePoint = {
  id: number;
  display_name: string;
  order?: number;
  actual_time: string;
  soge_type: string;
  point_type: "VisitingsCustomer" | "VisitingsPoint";
  address?: string;
  address_label?: string;
  wc?: boolean;
  walker_size?: number;
  passenger_count?: number;
  note?: string;
  visiting_id?: number | string;
  point_id?: number;
  arrival?: boolean;
  schedule_time?: string;
  ride_time?: number;
  wait_time?: string;
  car_restriction?: string;
  need_helper?: boolean;
  image?: string;
  customer_id?: number;
  customer?: {
    name: string;
    wc: boolean;
  };
  bookmark?: {
    address: string;
    address_label: string;
  };
  dnd_id: string;
};

export type VisitingGroup = {
  id?: number;
  new_id: string;
  car_id: number;
  car_name?: string;
  bin_order: number;
  departure_time?: string;
  arrival_time?: string;
  type?: string;
  user_count?: number;
  first_address?: string;
  wc_user_count?: number;
  cargo_volume?: number;
  driver_name?: string;
  tenjo_name?: string;
  route_points: RoutePoint[];
  is_optimized_route?: boolean;
};

export type Customer = {
  id: number;
  name: string;
  point_type: "VisitingsCustomer" | "VisitingsPoint";
  soge_type: string;
  display_name: string;
  wc: boolean;
  actual_time: string;
  visiting_id?: number | string;
  note?: string;
  passenger_count?: number;
  address?: string;
  dnd_id: string;
};

export type TourismVisitingGroup = {
  id?: number;
  new_id: string;
  car_id: number;
  car_name?: string;
  bin_order: number;
  departure_time?: string;
  arrival_time?: string;
  type?: string;
  user_count?: number;
  first_address?: string;
  wc_user_count?: number;
  cargo_volume?: number;
  driver_name?: string;
  tenjo_name?: string;
  route_points: TourismRoutePoint[];
  customers: Customer[];
  is_optimized_route?: boolean;
};

export type TourismRoutePoint = {
  id: number;
  display_name: string;
  order?: number;
  actual_time: string;
  soge_type: string;
  point_type: "VisitingsCustomer" | "VisitingsPoint";
  address?: string;
  address_label?: string;
  wc?: boolean;
  passenger_count?: number;
  note?: string;
  visiting_id?: number | string;
  point_id?: number;
  arrival?: boolean;
  schedule_time?: string;
  ride_time?: number;
  wait_time?: string;
  car_restriction?: string;
  need_helper?: boolean;
  image?: string;
  customer?: {
    name: string;
    wc: boolean;
  };
  bookmark?: {
    address: string;
    address_label: string;
  };
  dnd_id: string;
  customers?: TourismCustomerLine[];
};

export type TourismCustomerLine = {
  id: number;
  display_name: string;
  order?: number;
  actual_time: string;
  schedule_time: string;
  address: string;
  note: string;
  phone_number: string;
  soge_type: string;
  point_type: string;
  wc: boolean;
  passenger_count: number;
  dnd_id: string;
};
