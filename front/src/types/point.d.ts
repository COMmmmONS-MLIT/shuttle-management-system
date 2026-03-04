export type PointFormData = {
  id?: number;
  address_label: string;
  address: string;
  postal_code: string;
  room_name: string;
  phone_number: string;
  lat: number;
  lng: number;
  wait_time: number;
  car_restriction_id: number;
  car_restriction_name?: string;
  is_invalid?: boolean;
  is_public?: boolean;
};

export type PointApiResponse = {
  points: PointFormData[];
  total_pages: number;
  current_page: number;
  count: number;
};

export type PointDetailApiResponse = {
  point: PointFormData;
};

export type PointSearchParams = {
  page: number;
  per: number;
  order: string;
  address_label: string;
  address: string;
  car_restriction_id: string;
};
