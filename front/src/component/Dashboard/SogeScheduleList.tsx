import React from "react";
import SogeTypeColor from "./SogeTypeColor";
import SogeType from "../Widgets/SogeType";

// types
import { DashboardSchedule } from "@/types/dashboard";

// font awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faMap } from "@fortawesome/free-solid-svg-icons";

type SogeScheduleListProps = {
  schedule?: DashboardSchedule;
};

const SogeScheduleList: React.FC<SogeScheduleListProps> = ({ schedule }) => {
  if (!schedule) {
    return null;
  }

  const totalCustomers = schedule.customers?.length || 0;
  const totalWheelchairs =
    schedule.customers?.filter((customer) => customer.wc).length || 0;
  const totalWalkers =
    schedule.customers?.filter((customer) => customer.walker).length || 0;

  return (
    <div className="timeline-event-view">
      <div className="jqtl-event-content">
        <div className="vehicle">
          <dl>
            <dt>車両</dt>
            <dd>{schedule.car_name}</dd>
            <dt>運転手</dt>
            <dd>{schedule.driver_name}</dd>
            <dt>定員</dt>
            <dd>{totalCustomers}</dd>
            <dt>車椅子</dt>
            <dd>{totalWheelchairs}</dd>
            <dt>乗車人数</dt>
            <dd>{totalWalkers}</dd>
          </dl>
        </div>
        <div className="user viewport js-scroll">
          <p className="start">
            <strong>出発</strong>
          </p>
          <table className="userTable">
            <thead>
              <tr>
                <th>送迎</th>
                <th>
                  名前
                  <br />
                  住所
                </th>
                <th>
                  迎え時刻
                  <br />
                  開始時間
                </th>
                <th>車両制限</th>
                <th>歩行器</th>
                <th>車椅子</th>
              </tr>
            </thead>
            <tbody>
              {schedule.customers?.map((customer, i) => (
                <tr key={i}>
                  <td>{SogeType(customer.soge_type)}</td>
                  <td>
                    {customer.name}
                    <br />
                    {customer.address}
                  </td>
                  <td>
                    {customer.schedule_time}
                    <br />
                    {customer.start_time}
                  </td>
                  <td>{customer.car_restriction}</td>
                  <td>{customer.walker ? "あり" : "なし"}</td>
                  <td>{customer.wc ? "あり" : "なし"}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="end">
            <strong>到着</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SogeScheduleList;
