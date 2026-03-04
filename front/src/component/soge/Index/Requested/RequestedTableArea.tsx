import React, { useState, useEffect } from "react";
import HttpClient from "@/adapter/HttpClient";

import InputField from "@/component/FormControls/InputField";
import RequestedCustomerTable from "@/component/soge/Index/Requested/RequestedCustomerTable";
import { ResponseVisitingIndex } from "@/types/ApiResponse/visiting";
import { TourismVisitingGroup, VisitingGroup } from "@/types/soge";
import { useUser } from "@/contexts/UserContext";

// font awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPrint } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/router";

type Props = {
  date: string;
  setDate: (date: string) => void;
};

const RequestedTableArea = ({ date, setDate }: Props) => {
  const httpClient = new HttpClient();
  const router = useRouter();
  const { category } = useUser();
  const [visitingsGroups, setVisitingsGroups] = useState<
    (TourismVisitingGroup | VisitingGroup)[][]
  >([[], []]);
  const [cars, setCars] = useState<string[]>([]);

  useEffect(() => {
    if (date) {
      fetchVisitings();
    }
  }, [date]);

  const fetchVisitings = async () => {
    let url = "";
    if (category === "tourism") {
      url = "/tourism/visitings/requested_soge";
    } else if (category === "education") {
      url = "/education/visitings/requested_soge";
    } else {
      url = "/visitings/requested_soge";
    }

    const params = {
      visiting_search: {
        date: date,
      },
    };
    const res = await httpClient.get<ResponseVisitingIndex>(url, { params });
    setVisitingsGroups(res.data.visitings_groups);
    setCars(res.data.cars);
  };

  const moveToPrint = () => {
    router.push({
      pathname: "/soge/print_requested",
      query: { date },
    });
  };

  return (
    <>
      <div className="mainArea">
        <section>
          <div className="panelSCT">
            <div className="cont">
              <div className="head">
                <div className="selectbox">
                  <label className="date">
                    <InputField
                      type="date"
                      label="日付："
                      value={date}
                      setState={setDate}
                    />
                  </label>
                  <button onClick={moveToPrint}>
                    <FontAwesomeIcon icon={faPrint} />
                    印刷
                  </button>
                </div>
              </div>
              <RequestedCustomerTable
                visitingsGroups={visitingsGroups}
                cars={cars}
              />
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default RequestedTableArea;
