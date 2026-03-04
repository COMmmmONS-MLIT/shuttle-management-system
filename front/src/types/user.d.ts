export type User = {
  id: number;
  name: string;
  email: string;
  password: string;
  is_active: boolean;
  edit: boolean;
  role: string;
  role_text: string;
  customer_id?: number;
};

export type UserForm = {
  id: string;
  name: string;
  kana: string;
  email: string;
  password: string;
  role: string;
};
