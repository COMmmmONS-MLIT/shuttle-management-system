export type VisitingsCustomer = {
  id: number;
  date: string;
  order: number;
  soge_type: string;
  schedule_time: string;
  actual_time: string;
  start_time: string;
  wait_time: string;
  self: boolean;
  cd: number;
  name: string;
  name_kana: string;
  display_name: string;
  wc: boolean;
  distance: number;
  address: string;
  remarks: string;
  visiting_id?: number;
  image?: string;
  selected: boolean;
  need_helper?: boolean;
  ride_time?: string;
  self_pick_up: boolean;
  self_drop_off: boolean;
  customer_name: string;
  car_restriction: string;
  passenger_count?: number;
  pick_up_point_name?: string;
  drop_off_point_name?: string;
};

export type VisitingsCustomerPair = {
  id: number;
  customer_cd: string;
  visiting_id: number;
  date: string;
  customer_cd: string;
  customer_name: string;
  customer_kana: string;
  departure_time: string;
  pick_up_point_name: string;
  start_time: string;
  arrival_time: string;
  drop_off_point_name: string;
  self_pick_up: boolean;
  self_drop_off: boolean;
  rest: boolean;
  rest_reason: string;
  customer_stopped_at: string;
  is_absent: boolean;
  absence_reason: string;
  image: string;
  selected: boolean;
  edit: boolean;
  pick_up_request: boolean;
  drop_off_request: boolean;
  can_request?: boolean;
  addresses_options: {
    value: string;
    label: string;
  }[];
  pick_up_base_point_id: number;
  drop_off_base_point_id: number;
};

export type BulkRegisterForm = {
  start_date: string;
  end_date: string;
  customer_cd: string;
};

export type IndividualRegisterForm = {
  id?: number;
  customer_id?: number;
  customer_cd: string;
  date?: string;
  departure_time: string;
  start_time: string;
  arrival_time: string;
  self_pick_up: boolean;
  self_drop_off: boolean;
  is_absent?: boolean;
  absence_reason?: string;
  pick_up_point_id?: string;
  drop_off_point_id?: string;
  pick_up_base_point_id?: number;
  drop_off_base_point_id?: number;
  pick_up_request: boolean;
  drop_off_request: boolean;
  is_requested?: boolean;
  date?: string;
  can_request?: boolean;
};

export type VisitingsCustomerBooleanKeys = {
  [K in keyof VisitingsCustomerPair]: VisitingsCustomerPair[K] extends boolean
    ? K
    : never;
}[keyof VisitingsCustomerPair];

export type VisitingsCustomerNonBooleanKeys = {
  [K in keyof VisitingsCustomerPair]: VisitingsCustomerPair[K] extends boolean
    ? never
    : K;
}[keyof VisitingsCustomerPair];

export type VisitingsCustomerSearchParams = {
  customer_cd_or_kana: string;
  is_absent: boolean | string;
  order: string;
  start_date?: string;
  end_date?: string;
  date?: string;
};

export type AbsentCustomer = {
  customer_name: string;
  absence_reason: string;
};

export type SelfVisitingsCustomer = {
  customer_name: string;
  self_pick_up: boolean;
  self_drop_off: boolean;
};

// Tourism
export type TourismVisitingsCustomer = {
  id?: number;
  name: string;
  name_kana: string;
  phone_number: string;
  passenger_count: number;
  date: string;
  soge_type: string;
  schedule_time: string;
  base_point_id: number;
  is_requested?: boolean;
  point_id?: number;
  office_name?: string;
  note?: string;
  base_point_name?: string;
  point_name?: string;
  can_request?: boolean;
};

export type EducationVisitingsCustomer = {
  id?: number;
  customer_cd: string;
  name?: string;
  name_kana?: string;
  phone_number?: string;
  date: string;
  soge_type: string;
  schedule_time: string;
  base_point_id: number;
  is_requested?: boolean;
  point_id?: number;
  office_name?: string;
  can_request?: boolean;
  addresses_options: {
    value: string;
    label: string;
  }[];
};

export type RequestedVisitingsCustomer = {
  id: number;
  date: string;
  office_name: string;
  customer_id: number;
  customer_cd: string;
  customer_name: string;
  customer_kana: string;
  schedule_time: string;
  start_time: string;
  soge_type: string;
  note: string;
  address: string;
  wc: boolean;
  base_point_name: string;
  point_name: string;
};
