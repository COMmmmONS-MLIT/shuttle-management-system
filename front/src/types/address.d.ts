export type Address = {
  bid?: number;
  order: number;
  address_label: string;
  postal_code: string;
  address: string;
  room_name: string;
  phone_number: string;
  lat?: number;
  lng?: number;
  parking_lat?: number;
  parking_lng?: number;
  distance?: number;
  time?: number;
  wait_time?: number;
  acceptance_rate?: number;
  car_restriction_id?: number;
};
