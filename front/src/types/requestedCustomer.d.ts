type RequestedCustomer = {
  id: number;
  soge_type: string;
  office_name: string;
  date: string;
  name: string;
  name_kana: string;
  schedule_time: string;
  start_time: string;
  address: string;
  base_point_address: string;
  wc: boolean;
  walker: boolean;
  walker_size: string;
  need_helper: boolean;
  allowed: boolean;
  departure_address: string;
  arrival_address: string;
  departure_time: string;
  arrival_time: string;
  allowed: boolean;
  allowing_office_id: number;
  departure_address: string;
  arrival_address: string;
  is_cancellation_requested: boolean;
};

export default RequestedCustomer;
