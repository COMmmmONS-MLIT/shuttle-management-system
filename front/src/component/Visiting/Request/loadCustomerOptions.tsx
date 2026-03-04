import HttpClient from "@/adapter/HttpClient";

type Option = {
  label: string;
  value: string;
};

const loadCustomerOptions = async (
  inputValue: string
): Promise<Option[]> => {
  if (!inputValue || inputValue.trim().length === 0) {
    return [];
  }

  try {
    const httpClient = new HttpClient();
    const url = "/visitings_customers/search_customers";
    const response = await httpClient.get<{
      customers: Option[];
    }>(url, {
      params: { name: inputValue },
      skipLoading: true,
    });
    return response.data.customers;
  } catch (error) {
    return [];
  }
};

export default loadCustomerOptions;

