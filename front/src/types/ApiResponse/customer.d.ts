export type ResponseOfficeLatLng = {
  office_latlng: { lat: number; lng: number };
};

export type ResponseCustomer = {
  customer: Customer & {
    user?: {
      email: string;
    };
  };
  image: CustomerImage;
  addresses: Address[];
  use_cases: UseCase[];
};

export type ResponseCustomers = {
  customers: Customer[];
  total_pages: number;
  current_page: number;
  count: number;
};
