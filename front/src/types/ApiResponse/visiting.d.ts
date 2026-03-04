export type ResponseVisitingIndex = {
  visitings_groups: VisitingGroup[][];
  requesting_customers: RequestedCustomer[];
  cars: Car[];
  warnings?: {
    number: number;
    text: string;
    customer_id: number;
  }[];
  alerts: {
    id: number;
    messages: string[];
    alert_type: string;
    car_id: number;
    max_seat: number;
    total_passengers: number;
    visiting_id: number;
  }[];
  can_share_data?: boolean;
};

export type ResponseVisitingIndexTourism = {
  visitings_groups: VisitingGroup[][];
  requesting_customers: RequestedCustomer[];
  cars: Car[];
  warnings?: {
    number: number;
    text: string;
    customer_id: number;
  }[];
  alerts?: {
    id: number;
    messages: string[];
    alert_type: string;
    car_id: number;
    max_seat: number;
    total_passengers: number;
    visiting_id: number;
  }[];
  can_share_data?: boolean;
};

export type ResponseVisiting = {
  visiting: Visiting;
};

export type ResponseTourismVisiting = {
  visiting: TourismVisitingGroup;
};

export type ResponseOptimalRoute = {
  visiting: {
    departure_time: string;
    arrival_time: string;
    route_points: {
      id: number;
      actual_time: string;
    }[];
    is_optimized_route?: boolean;
  };
};

export type ResponseCanDriver = {
  can_driver: {
    id: number;
    name: string;
  }[];
  can_tenjo: {
    id: number;
    name: string;
  }[];
  selected_driver_id: number | null;
  selected_tenjo_id: number | null;
};

export type ResponseVisitingRoute = {
  points: {
    position: {
      lat: number;
      lng: number;
    };
    kinds: string;
    content: string;
  }[];
  order: number[];
  car_name: string;
  bin_order: string;
};

export type ResponsePointsOptions = {
  point_options: {
    label: string;
    value: number;
  }[];
};

export type ResponseVcPointOptions = {
  point_options: {
    label: string;
    value: number;
    is_office: boolean;
  }[];
};

export type ResponseSogeTypeOptions = {
  soge_type_options: {
    label: string;
    value: string;
  }[];
};
