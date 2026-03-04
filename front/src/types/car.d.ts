export type Car = {
  id?: number;
  name: string;
  number: string;
  max_seat: number;
  max_wc_seat: number;
  cargo_volume: number;
  car_pattern_name?: string;
  stopped: boolean;
  point_id?: number;
};

export type CarSearchParams = {
  id?: string;
  name?: string;
  number?: string;
  car_pattern_name?: string;
  per: number;
  order?: string;
  page: number;
  per: number;
};

export type CarRestriction = {
  id: number;
  name: string;
};
