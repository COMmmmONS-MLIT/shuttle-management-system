import React from "react";
import RequestedPointLine from "./RequestedPointLine";
import RequestedLine from "./RequestedLine";
import SogeType from "@/component/Widgets/SogeType";
import { useUser } from "@/contexts/UserContext";

// font awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faWheelchair,
  faBoxes,
  faUser,
  faUserTie,
  faUserNurse,
} from "@fortawesome/free-solid-svg-icons";

// types
import { TourismVisitingGroup, VisitingGroup } from "@/types/soge";

type Props = {
  bin: TourismVisitingGroup | VisitingGroup;
  order_index: number;
  bin_index: number;
};

const RequestedBinBlock = ({ bin, order_index, bin_index }: Props) => {
  const { category } = useUser();
  const isTourism = category === "tourism";

  return (
    <>
      {bin.route_points?.length > 0 ? (
        <td>
          <div className="panel">
            <dl className="time">
              <dt>出発</dt>
              <dd>{bin?.departure_time}</dd>
              <dt>到着</dt>
              <dd>{bin?.arrival_time}</dd>
            </dl>
            <div className="info">
              <p className="driver">
                <FontAwesomeIcon icon={faUserTie} />
                {bin?.driver_name || "未登録"}
              </p>
              <p className="nurse">
                <FontAwesomeIcon icon={faUserNurse} />
                {bin?.tenjo_name || "未登録"}
              </p>
            </div>
            <div className="status" style={{ whiteSpace: "nowrap" }}>
              <p className="pattern">{SogeType(bin?.type)}</p>
              <dl className="ride" style={{ flexWrap: "nowrap" }}>
                <dt>
                  <FontAwesomeIcon icon={faUser} />
                </dt>
                <dd>
                  <span className="js-ride-user">{bin.user_count}</span>人
                </dd>
                {!isTourism && (
                  <>
                    <dt>
                      <FontAwesomeIcon icon={faWheelchair} />
                    </dt>
                    <dd>
                      <span className="js-ride-wheelchair">
                        {bin.wc_user_count}
                      </span>
                      人
                    </dd>
                    <dt>
                      <FontAwesomeIcon icon={faBoxes} />
                    </dt>
                    <dd>
                      <span className="js-ride-boxes">{bin.cargo_volume}</span>
                    </dd>
                  </>
                )}
              </dl>
            </div>
            <ul className="user js-user" style={{ background: "none" }}>
              {bin.route_points.map((routePoint, index) => {
                if (isTourism) {
                  return (
                    <RequestedPointLine
                      key={routePoint.id}
                      routePoint={routePoint}
                    />
                  );
                } else {
                  return (
                    <RequestedLine
                      key={routePoint.id}
                      routePoint={routePoint}
                      orderNumber={index + 1}
                      isLast={index === bin.route_points.length - 1}
                    />
                  );
                }
              })}
            </ul>
          </div>
        </td>
      ) : (
        <td style={{ position: "relative" }}>
          <div className="panel" style={{ padding: "0px", minHeight: "50px" }}>
            <div className="button" style={{ margin: "0px" }}>
              <div className="edit"></div>
            </div>
          </div>
        </td>
      )}
    </>
  );
};

export default RequestedBinBlock;
