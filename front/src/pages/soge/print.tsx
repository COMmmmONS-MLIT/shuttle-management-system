import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import isValidDate from "@/component/Widgets/isValidDate";
import HttpClient from "@/adapter/HttpClient";
import moment from "moment";
import SogeType from "@/component/Widgets/SogeType";
import { useUser } from "@/contexts/UserContext";

// types
import { VisitingGroup, TourismRoutePoint, TourismCustomerLine } from "@/types/soge";
import { Car } from "@/types/car";
import { ResponseVisitingIndex } from "@/types/ApiResponse/visiting";

// font awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faWheelchair,
  faBoxes,
  faUserTie,
  faUserNurse,
  faUser,
} from "@fortawesome/free-solid-svg-icons";

const SogesPrintPage = () => {
  const httpClient = new HttpClient();
  const router = useRouter();
  const date = router.query.date as string;
  const { category } = useUser();

  const [visitingsGroups, setVisitingsGroups] = useState<VisitingGroup[][]>([
    [],
  ]);
  const [cars, setCars] = useState<Car[]>([]);
  const [warnings, setWarnings] = useState<any[]>([]);

  useEffect(() => {
    if (!isValidDate(date)) {
      router.push("/soge");
    }
  }, [date]);

  useEffect(() => {
    if (isValidDate(date)) {
      fetchVisitings();
    }
  }, [date]);

  const fetchVisitings = (d?: string) => {
    const params_date = date ? date : d;

    const url = category === "tourism" ? "/tourism/visitings" : "/visitings";
    const params = {
      visiting_search: {
        date: params_date,
      },
    };
    httpClient
      .get<ResponseVisitingIndex>(url, { params })
      .then((res) => {
        setVisitingsGroups(res.data.visitings_groups);
        setCars(res.data.cars);
        setWarnings(res.data.warnings || []);
      });
  };

  // 車を5台ずつのグループに分割する関数（必ず5つのヘッダー）
  const chunkCars = (cars: Car[], chunkSize: number = 5) => {
    const chunks: Car[][] = [];
    for (let i = 0; i < cars.length; i += chunkSize) {
      const chunk = cars.slice(i, i + chunkSize);
      // 5つに満たない場合は空のオブジェクトで埋める
      while (chunk.length < chunkSize) {
        chunk.push(null as any);
      }
      chunks.push(chunk);
    }
    return chunks;
  };

  const getWarningNumber = (customerId: number, sogeType: string) => {
    const warning = warnings.find(
      (w) => w.customer_id === customerId && w.soge_type === sogeType
    );
    return warning ? `※${warning.number}` : "";
  };

  return (
    <div id="container">
      <style jsx global>{`
        @media print {
          .page-break-before {
            page-break-before: always !important;
            break-before: page !important;
          }

          .page-break-after {
            page-break-after: always !important;
            break-after: page !important;
          }
        }
      `}</style>
      {chunkCars(cars).map((carChunk, chunkIndex) => (
        <section
          key={chunkIndex}
          className={
            chunkIndex < chunkCars(cars).length - 1
              ? "page-break-after"
              : "page-break-auto"
          }
        >
          <div className="pdfSCT">
            <div className="cont">
              <div className="head">
                <p>
                  {date}送迎表{" "}
                  {chunkCars(cars).length > 1
                    ? `(${chunkIndex + 1}/${chunkCars(cars).length})`
                    : ""}
                </p>
                <p>出力日：{moment().format("YYYY/MM/DD")}</p>
              </div>
              <div className="table vertical">
                <table>
                  <thead>
                    <tr>
                      {carChunk.map((car, index) => (
                        <th
                          key={car?.id || `empty-${index}`}
                          data-number={car?.number || ""}
                        >
                          {car ? (
                            <>
                              {car.name} {car.id + "号車"}
                              <br />（{car.number}）
                              <br />
                              <FontAwesomeIcon icon={faUsers} />
                              <span className="js-total-user">
                                {car.max_seat}
                              </span>
                              <FontAwesomeIcon icon={faWheelchair} />
                              <span className="js-total-wheelchair">
                                {car.max_wc_seat}
                              </span>
                              <FontAwesomeIcon icon={faBoxes} />
                              <span className="js-total-briefcase">
                                {car.cargo_volume}
                              </span>
                            </>
                          ) : (
                            <span>-</span>
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {visitingsGroups.map((bins, order_index) => (
                      <tr key={order_index}>
                        {carChunk.map((car, carIndex) => {
                          const bin = car ? bins[cars.indexOf(car)] : null;
                          return (
                            <>
                              {bin && bin.route_points?.length > 0 ? (
                                <td key={bin.id}>
                                  <div className="panel">
                                    <dl className="time">
                                      <dt>出発</dt>
                                      <dd>{bin?.departure_time}</dd>
                                      <dt>到着</dt>
                                      <dd>{bin?.arrival_time}</dd>
                                    </dl>
                                    <div
                                      className="info js-modalLink"
                                      data-modal="selectMDL"
                                    >
                                      <p className="driver">
                                        <FontAwesomeIcon icon={faUserTie} />
                                        {bin?.driver_name || "未登録"}
                                      </p>
                                      <p className="nurse">
                                        <FontAwesomeIcon icon={faUserNurse} />
                                        {bin?.tenjo_name || "未登録"}
                                      </p>
                                    </div>
                                    <div className="status">
                                      <p className="pattern">
                                        {SogeType(bin?.type)}
                                      </p>
                                      <dl className="ride">
                                        <dt>
                                          <FontAwesomeIcon icon={faUser} />
                                        </dt>
                                        <dd>
                                          <span className="js-ride-user">
                                            {bin.user_count}
                                          </span>
                                          人
                                        </dd>
                                        {category !== "tourism" && (
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
                                              <span className="js-ride-boxes">
                                                {bin.cargo_volume}
                                              </span>
                                            </dd>
                                          </>
                                        )}
                                      </dl>
                                    </div>
                                    <ul className="user js-user">
                                      {bin.route_points.map((point) => (
                                        <li key={point.id}>
                                          <p className="greet">
                                            <span>
                                              {point.display_name}
                                              {point.point_type ===
                                                "VisitingsCustomer" &&
                                                point.customer_id && (
                                                  <span
                                                    style={{
                                                      color: "#c00",
                                                      fontWeight: "bold",
                                                      marginLeft: "5px",
                                                    }}
                                                  >
                                                    {getWarningNumber(
                                                      point.customer_id,
                                                      bin?.type || ""
                                                    )}
                                                  </span>
                                                )}
                                            </span>
                                            {point.passenger_count && (
                                              <span>
                                                {point.passenger_count}人
                                              </span>
                                            )}
                                            <span>
                                              {point.wc &&
                                                category !== "tourism" && (
                                                  <FontAwesomeIcon
                                                    icon={faWheelchair}
                                                  />
                                                )}
                                            </span>
                                            <span>{point.actual_time}</span>
                                            {category !== "tourism" && (
                                              <span>{point.address}</span>
                                            )}
                                            <span
                                              style={{
                                                whiteSpace: "break-spaces",
                                              }}
                                            >
                                              {point.note}
                                            </span>
                                            {category === "tourism" &&
                                              (point as TourismRoutePoint).customers &&
                                              (point as TourismRoutePoint).customers!.map(
                                                (customer: TourismCustomerLine & { remarks?: string }, index: number) => (
                                                  <span
                                                    key={customer.id || index}
                                                    style={{
                                                      whiteSpace: "break-spaces",
                                                      width: "100%",
                                                      flexBasis: "100%",
                                                    }}
                                                  >
                                                    {customer.remarks}
                                                  </span>
                                                )
                                              )}
                                          </p>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                </td>
                              ) : (
                                <td>
                                  <div className="panel">
                                    <p>-</p>
                                  </div>
                                </td>
                              )}
                            </>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      ))}
      <section className="page-break-before">
        <div className="pdfSCT2">
          <div className="cont">
            <dl>
              {warnings.map((warning) => (
                <>
                  <dt>※{warning.number}</dt>
                  <dd>{warning.text}</dd>
                </>
              ))}
            </dl>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SogesPrintPage;
