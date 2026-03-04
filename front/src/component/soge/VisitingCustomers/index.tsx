import VisitingsCustomersList from "../VisitingsCustomersList";
import SuggestedVisitingsCustomersList from "../SuggestedVisitingsCustomersList";
import TourismVisitingsCustomersList from "../Tourism/VisitingsCustomersList";
import SelfVisitsList from "../SelfVisitsList";
import AbsentCustomersList from "../AbsentCustomersList";
import RequestingCustomersTable from "@/component/RequestingCustomers/RequestingCustomersTable";
// types
import {
  VisitingsCustomer,
  AbsentCustomer,
  SelfVisitingsCustomer,
} from "@/types/visitingsCustomer";
import RequestedCustomer from "@/types/requestedCustomer";
// context
import { useUser } from "@/contexts/UserContext";
import { useEffect, useState } from "react";
import { SuggestedVisitingsCustomersContext } from "@/contexts/SuggestedVisitingsCustomersContext";

type Props = {
  visitingsCustomers: {office_name: string, visitings_customers: VisitingsCustomer[]}[];
  selfVisitingsCustomers: SelfVisitingsCustomer[];
  absentCustomers: AbsentCustomer[];
  requestingCustomers: RequestedCustomer[];
  date?: string;
  onSuggestedCustomersChange?: (customers: VisitingsCustomer[]) => void;
};

const VisitingCustomers = ({
  visitingsCustomers,
  selfVisitingsCustomers,
  absentCustomers,
  requestingCustomers,
  date,
  onSuggestedCustomersChange,
}: Props) => {
  const { category } = useUser();

  const [suggestedCustomers, setSuggestedCustomers] = useState<
    VisitingsCustomer[]
  >([]);
  const [selectedCustomer, setSelectedCustomer] = useState<VisitingsCustomer | null>(null);

  useEffect(() => {
    if (date) {
      setSuggestedCustomers([]);
      setSelectedCustomer(null);
      onSuggestedCustomersChange?.([]);
    }
  }, [date, onSuggestedCustomersChange]);

  useEffect(() => {
    if (suggestedCustomers.length > 0) {
      setSuggestedCustomers((prev) => {
        const updated = prev.map((suggested) => {
          const updatedCustomer = visitingsCustomers.flatMap((group) => group.visitings_customers).find(
            (vc) => vc.id === suggested.id
          );
          if (updatedCustomer) {
            return {
              ...suggested,
              selected: updatedCustomer.selected,
            };
          }
          return suggested;
        });
        onSuggestedCustomersChange?.(updated);
        return updated;
      });
    }
  }, [visitingsCustomers, onSuggestedCustomersChange]);

  const handleSetSuggestedCustomers = (customers: VisitingsCustomer[]) => {
    setSuggestedCustomers(customers);
    onSuggestedCustomersChange?.(customers);
  };

  return (
    <div className="subArea">
      <section>
        <div className="transferSCT">
          <div className="cont">
            {category === "tourism" || category === "education" ? (
              visitingsCustomers.map((officeData, index) => (
                <TourismVisitingsCustomersList
                  key={index}
                  officeName={officeData.office_name}
                  visitingsCustomers={officeData.visitings_customers}
                />
              ))
            ) : (
              <SuggestedVisitingsCustomersContext.Provider
                value={{
                  suggestedCustomers,
                  setSuggestedCustomers: handleSetSuggestedCustomers,
                  selectedCustomer,
                  setSelectedCustomer
                }}
              >
                {visitingsCustomers.map((officeData, index) => (
                  <VisitingsCustomersList
                    key={index}
                    officeName={officeData.office_name}
                    visitingsCustomers={officeData.visitings_customers}
                  />
                ))}
                {suggestedCustomers.length > 0 && (
                  <SuggestedVisitingsCustomersList />
                )}
                <SelfVisitsList
                  selfVisitingsCustomers={selfVisitingsCustomers}
                />
                <AbsentCustomersList absentCustomers={absentCustomers} />
               <RequestingCustomersTable
                  requestingCustomers={requestingCustomers}
                  showCancelButton={false}
                />
              </SuggestedVisitingsCustomersContext.Provider>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default VisitingCustomers;
