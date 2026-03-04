export type CarIndexResponse = {
  cars: Car[];
};

export type ResponseVisitingsCustomerIndex = {
  visitings_customers_except_self: {office_name: string, visitings_customers: VisitingsCustomer[]}[];
  visitings_customers_self?: SelfVisitingsCustomer[];
  visitings_customers_absent?: AbsentCustomer[];
};
