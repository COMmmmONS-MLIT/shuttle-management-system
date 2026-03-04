export type Bindatad = {
  boarding_time?: string;
  alighting_time?: string;
  update_time_c?: string;
  update_time_u?: string;
};

export type Mergedata = {
  date?: string;
  scheduled_time?: string;
  customer_cd?: string;
  soge_type?: string;
  office_cd?: string;
  car_number?: string;
  car_id?: number;
  bindatad?: Bindatad | null;
  lat1?: number;
  lng1?: number;
  lat3?: number;
  lng3?: number;
};
