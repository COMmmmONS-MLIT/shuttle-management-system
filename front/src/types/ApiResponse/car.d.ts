export type ResponseCarsData = {
  total_pages: number;
  current_page: number;
  count: number;
  cars: Car[];
};

export type ResponseCarData = {
  car: Car;
  car_pattern: CarPattern;
};
