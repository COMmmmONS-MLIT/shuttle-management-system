export interface CustomerNg {
  id: number;
  customer_a_id: number;
  customer_b_id: number;
  reason: string;
  created_at: string;
  updated_at: string;
  customer_a: CustomerNgPerson;
  customer_b: CustomerNgPerson;
}

export interface CustomerNgPerson {
  id: number;
  name: string;
  name_kana: string;
  image?: string;
}

export interface CustomerNgForm {
  customer_a_id: number;
  customer_b_id: number;
  reason: string;
}

export interface CustomerNgSearchParams {
  customer_a_cd_or_name: string;
  customer_b_cd_or_name: string;
  order?: string;
  page?: number;
  per?: number;
}
