import React from "react";
import { useRouter } from "next/router";
import Line from "./Line";
import BlankArea from "./BlankArea";
import getOptimalRoute from "../Requests/getOptimalRoute";
import getDistanceRoute from "../Requests/getDistanceRoute";
import putUpdateTime from "../Requests/putUpdateTime";
import {
  SuccessToast,
  ErrorToast,
} from "@/component/ReactHotToast/ToastMessage";
import HttpClient from "@/adapter/HttpClient";
import SuccessResponse from "@/types/ApiResponse/success";
import SogeType from "@/component/Widgets/SogeType";
import InputField from "@/component/FormControls/InputField";

// font awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faWheelchair,
  faBoxes,
  faUser,
  faEdit,
  faMap,
  faSync,
  faUserTie,
  faUserNurse,
  faRoute,
  faTrash,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";

// dnd-kit
import { useSortable } from "@dnd-kit/sortable";

// types
import { VisitingGroup, RoutePoint } from "@/types/soge";

type Props = {
  bin: VisitingGroup;
  order_index: number;
  bin_index: number;
  activeId?: number | string | null;
  canSort?: boolean;
  overBinId?: number | string | null;
  date: string;
  setVisitingsGroups: React.Dispatch<React.SetStateAction<VisitingGroup[][]>>;
  openDriverModal: (visitingId: number) => void;
  onClickMap: (visitingId: number) => void;
  setMapVersion: React.Dispatch<React.SetStateAction<number>>;
  fetchVisitingsCustomers: (d?: string) => void;
  fetchVisitings: (d?: string) => void;
};

const BinBlock = ({
  bin,
  order_index,
  bin_index,
  activeId,
  canSort,
  overBinId,
  date,
  setVisitingsGroups,
  openDriverModal,
  onClickMap,
  setMapVersion,
  fetchVisitingsCustomers,
  fetchVisitings,
}: Props) => {
  const router = useRouter();
  const binId = bin.id || bin.new_id;
  const { setNodeRef } = useSortable({ id: binId });

  const moveToEdit = () => {
    router.push(`/soge/${bin.id}?date=${date}`);
  };

  const handleDelete = async (url: string) => {
    try {
      const httpClient = new HttpClient();
      const response = await httpClient.delete<SuccessResponse>(url);

      SuccessToast(response.data.messages);

      fetchVisitingsCustomers();
      fetchVisitings();
    } catch (error) {
      console.error("削除に失敗しました:", error);
      ErrorToast(["削除に失敗しました"]);
    }
  };

  const handleDeleteRoutePoint = async (routePointId: number) => {
    const routePointToDelete = bin.route_points.find(
      (routePoint) => routePoint.id === routePointId
    );
    if (!routePointToDelete) {
      ErrorToast(["削除対象の利用者が見つかりません"]);
      return;
    }

    // 利用者のみ削除可能
    if (routePointToDelete.point_type === "VisitingsCustomer") {
      await handleDelete(
        `/visitings_customers/${routePointToDelete.id}/remove_from_visiting`
      );

      if (bin.id && bin.route_points.length > 0) {
        const newRoutePoints = bin.route_points.filter(
          (routePoint) => routePoint.id !== routePointId
        );
        const hasVisitingsCustomer = newRoutePoints.some(
          (routePoint) => routePoint.point_type === "VisitingsCustomer"
        );
        if (hasVisitingsCustomer) {
          await putUpdateTime(bin.id, newRoutePoints, undefined, bin.departure_time);
        }
      }

      fetchVisitings();
    }
  };

  const handleDepartureTimeChange = async (newDepartureTime: string) => {
    if (!bin.id) return;

    setVisitingsGroups((prev) => {
      const newBins = [...prev];
      newBins[order_index][bin_index] = {
        ...bin,
        departure_time: newDepartureTime,
      };
      return newBins;
    });

    await putUpdateTime(bin.id, bin.route_points, undefined, newDepartureTime);
    fetchVisitings();
  };

  const handleDeleteAllCustomers = async () => {
    if (!confirm("この便の全ての利用者を削除しますか？")) {
      return;
    }

    await handleDelete(`/visitings/${bin.id}/remove_all_customers`);
  };

  const fetchOptimalTime = async () => {
    const id = bin.id as number;
    const distanceRoute = await getDistanceRoute(id);
    setMapVersion((prev) => prev + 1);
    setVisitingsGroups((prev) => {
      const newBins = [...prev];

      const newRoutePoints = bin.route_points.map((routePoint) => {
        const updatedPoint = distanceRoute.route_points?.find(
          (vc) => vc.id === routePoint.id
        );
        if (updatedPoint) {
          return {
            ...routePoint,
            actual_time: updatedPoint.actual_time,
          };
        }
        return routePoint;
      });

      newBins[order_index][bin_index] = {
        ...bin,
        departure_time: distanceRoute.departure_time,
        arrival_time: distanceRoute.arrival_time,
        route_points: newRoutePoints,
        is_optimized_route: distanceRoute.is_optimized_route,
      };
      return newBins;
    });

    fetchVisitings();
  };

  const isOverThis = overBinId === binId;

  return (
    <>
      {bin.route_points?.length > 0 ? (
        <td ref={setNodeRef} style={{
          verticalAlign: "top",
          border: "none",
          borderRight: "solid 1px var(--color-set1)",
          borderBottom: "solid 1px var(--color-set1)",
        }}>
          <div 
            className="panel"
            style={{
              backgroundColor: isOverThis ? "#e3f2fd" : undefined,
              border: isOverThis ? "2px solid #2196f3" : "none",
              padding: "10px",
            }}
          >
            <dl className="time">
              <dt>出発</dt>
              <dd>
                <InputField
                  label=""
                  type="time"
                  labelClassName=""
                  inputClassName="short"
                  value={bin?.departure_time || ""}
                  setState={(value: string) => handleDepartureTimeChange(value)}
                />
              </dd>
              <dt>到着</dt>
              <dd>{bin?.arrival_time}</dd>
            </dl>
            <div
              className="info js-modalLink"
              data-modal="selectMDL"
              onClick={() => openDriverModal(bin.id as number)}
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
            <div className="status" style={{ whiteSpace: "nowrap" }}>
              <p className="pattern">{SogeType(bin?.type)}</p>
              <dl className="ride" style={{ flexWrap: "nowrap" }}>
                <dt>
                  <FontAwesomeIcon icon={faUser} />
                </dt>
                <dd>
                  <span className="js-ride-user">{bin.user_count}</span>人
                </dd>
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
              </dl>
            </div>
            <ul className="user js-user" style={{
              backgroundColor: "transparent",
              background: "none",
            }}>
              {bin.route_points.map((routePoint, index) => (
                <Line
                  key={routePoint.id}
                  routePoint={routePoint}
                  activeId={activeId}
                  canSort={canSort}
                  onDelete={handleDeleteRoutePoint}
                  orderNumber={index + 1}
                  isLast={index === bin.route_points.length - 1}
                />
              ))}
            </ul>

            <div className="button" style={{ justifyContent: "flex-end" }}>
              <div className="calculation">
                <button
                  type="button"
                  aria-label={bin.is_optimized_route ? "最適ルート適用済み" : "計算"}
                  onClick={fetchOptimalTime}
                  style={{
                    backgroundColor: bin.is_optimized_route ? "#e0e0e0" : undefined,
                  }}
                >
                  <FontAwesomeIcon
                    icon={bin.is_optimized_route ? faCheckCircle : faRoute}
                  />
                  {bin.is_optimized_route ? "最適ルート適用済み" : "最適ルートに変更"}
                </button>
              </div>
            </div>
            <div className="button" style={{ justifyContent: "flex-end" }}>
              <div className="edit" style={{ marginRight: "10px" }}>
                <button type="button" aria-label="修正" onClick={moveToEdit}>
                  <FontAwesomeIcon icon={faEdit} />
                  修正
                </button>
              </div>
              <div className="map" style={{ marginRight: "10px" }}>
                <button
                  type="button"
                  aria-label="地図"
                  onClick={() => onClickMap(bin.id as number)}
                >
                  <FontAwesomeIcon icon={faMap} />
                  地図
                </button>
              </div>
              <div>
                <button
                  type="button"
                  aria-label="全削除"
                  onClick={handleDeleteAllCustomers}
                  style={{ backgroundColor: "#fa4c4c", color: "white" }}
                >
                  <FontAwesomeIcon icon={faTrash} />
                  全削除
                </button>
              </div>
            </div>
          </div>
        </td>
      ) : (
        <BlankArea
          order_index={order_index}
          bin_index={bin_index}
          overBinId={overBinId}
          date={date}
          car_id={bin.car_id}
          bin_order={bin.bin_order}
        />
      )}
    </>
  );
};

export default BinBlock;
