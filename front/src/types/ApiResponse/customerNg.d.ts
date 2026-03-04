import { CustomerNg } from "@/types/customerNg";

export interface CustomerNgsResponse {
  customer_ngs: CustomerNg[];
  total_pages?: number;
  current_page?: number;
  count?: number;
}

export interface CustomerNgResponse {
  customer_ng: CustomerNg;
}

export interface CustomerOptionsResponse {
  customer_options: Array<{
    value: number;
    label: string;
  }>;
}
