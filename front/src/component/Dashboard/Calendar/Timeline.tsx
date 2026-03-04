import React, { useState, useEffect } from "react";
import DriverTimeline from "./Driver";
import CarTimeline from "./Car";
import SogeScheduleList from "../SogeScheduleList";
import HttpClient from "@/adapter/HttpClient";

// context
import { useUser } from "@/contexts/UserContext";

// types
import {
  DashboardResponse,
  DashboardDriver,
  DashboardCar,
  DashboardSchedule,
} from "@/types/dashboard";

// font awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarAlt,
  faDownload,
  faUserTie,
  faShuttleVan,
} from "@fortawesome/free-solid-svg-icons";

type Props = {
  date: string;
};

const CalendarTimeline = ({ date }: Props) => {
  const [selectedTab, setSelectedTab] = useState<"driver" | "car">("driver");
  const [selectedSchedule, setSelectedSchedule] = useState<number | null>(null);

  const [drivers, setDrivers] = useState<DashboardDriver[]>([]);
  const [cars, setCars] = useState<DashboardCar[]>([]);
  const [schedules, setSchedules] = useState<DashboardSchedule[]>([]);

  const httpClient = new HttpClient();
  const { category } = useUser();

  const fetchData = async (date: string) => {
    try {
      const url = "/dashboard/schedule";
      const params = {
        params: {
          date: date,
        },
      };

      const response = await httpClient.get<DashboardResponse>(url, params);
      setDrivers(response.data.drivers);
      setCars(response.data.cars);
      setSchedules(response.data.schedules);
    } catch (error) {
      console.error("Dashboard data fetch error:", error);
    }
  };

  useEffect(() => {
    fetchData(date);
  }, [date]);

  const handleTabChange = (tab: "driver" | "car") => {
    setSelectedTab(tab);
  };

  const openDetailTable = (id: number) => {
    setSelectedSchedule(id);
  };

  const formatDateForDisplay = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });
  };
  const formatWeekdayForDisplay = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ja-JP", {
      weekday: "long",
    });
  };

  return (
    <>
      <section>
        <div className="timeLineSCT">
          <div className="cont">
            <div className="head">
              <h2>
                <FontAwesomeIcon icon={faCalendarAlt} />
                送迎表
              </h2>
            </div>
            <ul className="Tabs1 js-tabs">
              <li>
                <a
                  className={selectedTab === "driver" ? "active" : ""}
                  onClick={() => handleTabChange("driver")}
                  style={{ cursor: "pointer" }}
                >
                  <FontAwesomeIcon icon={faUserTie} />
                  運転手
                </a>
              </li>
              <li>
                <a
                  className={selectedTab === "car" ? "active" : ""}
                  onClick={() => handleTabChange("car")}
                  style={{ cursor: "pointer" }}
                >
                  <FontAwesomeIcon icon={faShuttleVan} />
                  車両
                </a>
              </li>
            </ul>
            <div
              className="block active"
              id="driverBLK"
              style={{ marginTop: "10px" }}
            >
              <div className="memo">
                <ul className="patterns">
                  <li className="pattern1">迎え</li>
                  <li className="pattern2">送り</li>
                </ul>
              </div>
            </div>
            <div className="gantt-container">
              {/* 日付ヘッダー */}
              <div className="date-header">
                <div className="date-main">{formatDateForDisplay(date)}</div>
                <div>{formatWeekdayForDisplay(date)}</div>
              </div>
              {selectedTab === "driver" && (
                <DriverTimeline
                  drivers={drivers}
                  schedules={schedules}
                  openDetailTable={openDetailTable}
                />
              )}
              {selectedTab === "car" && (
                <CarTimeline
                  cars={cars}
                  schedules={schedules}
                  openDetailTable={openDetailTable}
                />
              )}
            </div>
            {selectedSchedule && category === "welfare" && (
              <SogeScheduleList
                schedule={schedules.find((s) => s.id === selectedSchedule)}
              />
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default CalendarTimeline;
