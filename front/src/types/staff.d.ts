export type Staffs = {
  id?: number;
  cd: string;
  name: string;
  name_kana: string;
  category: number;
  can_driver: boolean;
  can_helper: boolean;
  driver_type: number;
  mail: string;
  tel: string;
  updated_at: string;
  is_stopped: boolean;
  can_driving_cars: {
    car_pattern: {
      id: number;
      name: string;
    };
  }[];
};

export type StaffSearchParams = {
  id?: string;
  cd_or_kana?: string;
  can_driver?: string;
  can_helper?: string;
  order?: string;
  per: number;
  page: number;
  registrationedAt?: string;
  concellationedAt?: string;
  ng?: string;
};
