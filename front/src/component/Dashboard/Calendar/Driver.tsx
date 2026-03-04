import React, { useRef, useEffect } from "react";
import SogeTypeColor from "../SogeTypeColor";

// types
import { DashboardDriver, DashboardSchedule } from "@/types/dashboard";

type props = {
  drivers: DashboardDriver[];
  schedules: DashboardSchedule[];
  openDetailTable: (id: number) => void;
};
const DriverTimeline = ({ drivers, schedules, openDetailTable }: props) => {
  const timeHeadersRef = useRef<HTMLDivElement | null>(null);
  const scheduleAreaRef = useRef<HTMLDivElement | null>(null);

  // 時間軸（0時から23時まで拡張）
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // スクロール同期
  useEffect(() => {
    const timeHeaders = timeHeadersRef.current;
    const scheduleArea = scheduleAreaRef.current;

    if (!timeHeaders || !scheduleArea) return;

    const syncFromHeaders = (e: Event) => {
      const target = e.target as HTMLElement;
      scheduleArea.scrollLeft = target.scrollLeft;
    };

    const syncFromSchedule = (e: Event) => {
      const target = e.target as HTMLElement;
      timeHeaders.scrollLeft = target.scrollLeft;
    };

    timeHeaders.addEventListener("scroll", syncFromHeaders);
    scheduleArea.addEventListener("scroll", syncFromSchedule);

    return () => {
      timeHeaders.removeEventListener("scroll", syncFromHeaders);
      scheduleArea.removeEventListener("scroll", syncFromSchedule);
    };
  }, []);

  // 時間を表示用にフォーマット
  const formatHour = (hour: number) => {
    return `${hour}:00`;
  };

  // スケジュールブロックの位置とサイズを計算
  const getScheduleStyle = (startTime: number, duration: number) => {
    const cellWidth = 60; // 固定幅（px）
    const left = startTime * cellWidth;
    const width = duration * cellWidth - 1; // ボーダー分を調整

    return {
      left: `${left}px`,
      width: `${width}px`,
    };
  };

  return (
    <>
      <div className="gantt-content">
        <div className="left-column">
          <div className="time-header-container"></div>

          <div className="drivers-list">
            {drivers.map((driver) => (
              <div key={driver.id} className="driver-name-cell">
                {driver.name}
              </div>
            ))}
          </div>
        </div>

        <div className="right-column">
          <div className="time-headers" ref={timeHeadersRef}>
            <div className="time-headers-content">
              {hours.map((hour) => (
                <div key={hour} className="time-header">
                  {formatHour(hour)}
                </div>
              ))}
            </div>
          </div>

          <div className="schedule-area" ref={scheduleAreaRef}>
            <div className="schedule-content">
              {drivers.map((driver) => (
                <div key={driver.id} className="driver-row">
                  {/* 時間セルの背景 */}
                  {hours.map((hour) => (
                    <div key={hour} className="time-cell"></div>
                  ))}

                  {schedules
                    .filter((schedule) => schedule.driver_id === driver.id)
                    .map((schedule) => (
                      <div
                        key={schedule.id}
                        className="schedule-block"
                        style={{
                          backgroundColor: SogeTypeColor(schedule.type),
                          ...getScheduleStyle(
                            schedule.start_time,
                            schedule.duration
                          ),
                        }}
                        title={`${schedule.id} (${schedule.start_time}:00 - ${
                          schedule.start_time + schedule.duration
                        }:00)`}
                        onClick={() => {
                          openDetailTable(schedule.id);
                        }}
                      >
                        {schedule.car_name}
                      </div>
                    ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DriverTimeline;
