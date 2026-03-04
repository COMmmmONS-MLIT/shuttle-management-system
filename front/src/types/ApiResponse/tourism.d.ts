export type ResponseAcceptOfficeOptions = {
  accept_office_options: {
    label: string;
    value: number;
  }[];
};

export type ResponsePointOptions = {
  point_options: {
    label: string;
    value: number;
    is_office: boolean;
  }[];
};
