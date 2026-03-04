import React, { useState, useEffect } from "react";
import HttpClient from "@/adapter/HttpClient";

// context
import { useUser } from "@/contexts/UserContext";

// font awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartBar, faDownload } from "@fortawesome/free-solid-svg-icons";

type OfficeRequestCount = {
  office_id: number;
  office_name: string;
  request_count: number;
};

type StatisticsData = {
  total_customers: number;
  absent_customers: number;
  total_pickup_customers?: number;
  total_dropoff_customers?: number;
  accept_office_request_counts?: OfficeRequestCount[];
};

type Props = {
  date: string;
};

const Statistics = ({ date }: Props) => {
  const [statistics, setStatistics] = useState<StatisticsData>({
    total_customers: 0,
    absent_customers: 0,
    total_pickup_customers: 0,
    total_dropoff_customers: 0,
    accept_office_request_counts: [],
  });

  const httpClient = new HttpClient();
  const { category } = useUser();

  const fetchStatistics = async (date: string) => {
    try {
      const url =
        category === "tourism"
          ? "/tourism/dashboard/statistics"
          : "/dashboard/statistics";
      const params = {
        params: {
          date: date,
        },
      };

      const response = await httpClient.get<{ statistics: StatisticsData }>(
        url,
        params,
      );
      setStatistics(response.data.statistics);
    } catch (error) {
      console.error("Statistics data fetch error:", error);
    }
  };

  useEffect(() => {
    fetchStatistics(date);
  }, [category, date]);

  return (
    <section>
      <div className="statsSCT">
        <div className="cont">
          <div className="head">
            <h2>
              <FontAwesomeIcon icon={faChartBar} />
              統計
            </h2>
          </div>
          <div className="list">
            {category !== "tourism" && (
              <div className="block">
                <h3>来館者数</h3>
                <p>{statistics.total_customers}人</p>
              </div>
            )}
            {category === "tourism" && (
              <>
                {statistics.accept_office_request_counts &&
                  statistics.accept_office_request_counts.length > 0 &&
                  statistics.accept_office_request_counts.map(
                    (office, index) => (
                      <div className="block" key={office.office_id || index}>
                        <h3>{office.office_name}</h3>
                        <p>{office.request_count}人</p>
                      </div>
                    ),
                  )}
                <div className="block">
                  <h3>迎え</h3>
                  <p style={{ borderRadius: "5px" }}>
                    {statistics.total_pickup_customers}人
                  </p>
                </div>
                <div className="block">
                  <h3>送り</h3>
                  <p style={{ borderRadius: "5px" }}>
                    {statistics.total_dropoff_customers}人
                  </p>
                </div>
              </>
            )}
            {category === "welfare" && (
              <div className="block">
                <h3>休み</h3>
                <p>{statistics.absent_customers}人</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Statistics;
