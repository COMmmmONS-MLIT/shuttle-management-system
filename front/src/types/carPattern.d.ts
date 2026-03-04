export type CarPattern = {
  id?: number;
  name: string;
  car_type: string;
  restriction_ids?: number[];
  wc_numbers: CarPatternWcNumber[];
};
