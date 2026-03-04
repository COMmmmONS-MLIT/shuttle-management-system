import { createContext } from "react";
import { VisitingsCustomer } from "@/types/visitingsCustomer";

type SuggestedVisitingsCustomersContextType = {
  suggestedCustomers: VisitingsCustomer[];
  setSuggestedCustomers: (suggestedCustomers: VisitingsCustomer[]) => void;
  selectedCustomer: VisitingsCustomer | null;
  setSelectedCustomer: (customer: VisitingsCustomer | null) => void;
};

export const SuggestedVisitingsCustomersContext =
  createContext<SuggestedVisitingsCustomersContextType>({
    suggestedCustomers: [],
    setSuggestedCustomers: ([]) => {},
    selectedCustomer: null,
    setSelectedCustomer: () => {},
  });
