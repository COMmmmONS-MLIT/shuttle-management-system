import React, { useEffect, useState } from "react";
import VisitingsCustomersList from "./VisitingsCustomersList";
import VisitingCustomers from "./VisitingCustomers";
import CustomerList from "./CustomerList";
import HttpClient from "@/adapter/HttpClient";
import Overlay from "./Overlay";
import putUpdateTime from "./Requests/putUpdateTime";
import getDistanceRoute from "./Requests/getDistanceRoute";
import RouteMap from "./Index/RouteMap";
import {
  SuccessToast,
  ErrorToast,
} from "@/component/ReactHotToast/ToastMessage";

// context
import { useUser } from "@/contexts/UserContext";

// fontawesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShuttleVan,
  faRoute,
  faMap,
  faSave,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";

// types
import { Visiting } from "@/types/visiting";
import { RoutePoint } from "@/types/soge";
import {
  VisitingsCustomer,
  AbsentCustomer,
  SelfVisitingsCustomer,
} from "@/types/visitingsCustomer";
import { ResponseVisitingsCustomerIndex } from "@/types/ApiResponse/soge";
import { SelectOption } from "@/types/FormControll/selectOption";
import SelectField from "@/component/FormControls/SelectField";
import RequestedCustomer from "@/types/requestedCustomer";

// dnd-kit
import {
  DndContext,
  DragOverEvent,
  DragEndEvent,
  MeasuringStrategy,
  useSensors,
  useSensor,
  MouseSensor,
  TouchSensor,
  pointerWithin,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";

const yotetimeAdjustOptions = [
  { label: "+60", value: 60 },
  { label: "+30", value: 30 },
  { label: "+10", value: 10 },
  { label: "+5", value: 5 },
  { label: "+1", value: 1 },
  { label: "設定時刻に合わせる", value: 0 },
  { label: "-1", value: -1 },
  { label: "-5", value: -5 },
  { label: "-10", value: -10 },
  { label: "-30", value: -30 },
  { label: "-60", value: -60 },
];

type Props = {
  visiting: Visiting;
  setVisiting: React.Dispatch<React.SetStateAction<Visiting>>;
  fetchVisiting: (adjustmentTime?: number) => void;
  adjustmentTime: number;
  setAdjustmentTime: React.Dispatch<React.SetStateAction<number>>;
  pointsOptions: SelectOption[];
};

const SogeForm = ({
  visiting,
  setVisiting,
  fetchVisiting,
  adjustmentTime,
  setAdjustmentTime,
  pointsOptions,
}: Props) => {
  const { category } = useUser();
  const httpClient = new HttpClient();
  const [openSeatForm] = useState(false);
  const [visitingsCustomers, setVisitingsCustomers] = useState<
    { office_name: string; visitings_customers: VisitingsCustomer[] }[]
  >([]);
  const [selfVisitingsCustomers, setSelfVisitingsCustomers] = useState<
    SelfVisitingsCustomer[]
  >([]);
  const [absentCustomers, setAbsentCustomers] = useState<AbsentCustomer[]>([]);
  const [requestingCustomers, setRequestingCustomers] = useState<
    RequestedCustomer[]
  >([]);
  const [activeId, setActiveId] = useState<string | number | null>(null);
  const [openMap, setOpenMap] = useState(false);
  const [mapVersion, setMapVersion] = useState(0);
  const [suggestedCustomers, setSuggestedCustomers] = useState<
    VisitingsCustomer[]
  >([]);

  // customersListWithVisitingsCustomersは全ての便内のroute_pointsの配列とvisitingsCustomersの配列を合わせた配列
  const customersListWithVisitingsCustomers: RoutePoint[] = [
    ...visiting.route_points,
    ...visitingsCustomers.flatMap((group) =>
      group.visitings_customers.map((vc) => ({
        id: vc.id,
        display_name: vc.name,
        order: 0,
        actual_time: vc.actual_time,
        soge_type: vc.soge_type,
        point_type: "VisitingsCustomer" as const,
        wc: vc.wc,
        visiting_id: vc.visiting_id || 0,
        note: vc.remarks,
        passenger_count: vc.passenger_count,
        address: vc.address,
        image: vc.image,
        schedule_time: vc.schedule_time,
        wait_time: vc.wait_time,
        car_restriction: vc.car_restriction,
        ride_time: vc.ride_time ? parseInt(vc.ride_time) : undefined,
        need_helper: vc.need_helper,
        dnd_id: "vc-" + vc.id,
      })),
    ),
    ...suggestedCustomers.map((vc) => ({
      id: vc.id,
      display_name: vc.name,
      order: 0,
      actual_time: vc.actual_time,
      soge_type: vc.soge_type,
      point_type: "VisitingsCustomer" as const,
      wc: vc.wc,
      visiting_id: vc.visiting_id || 0,
      note: vc.remarks,
      passenger_count: vc.passenger_count,
      address: vc.address,
      image: vc.image,
      schedule_time: vc.schedule_time,
      wait_time: vc.wait_time,
      car_restriction: vc.car_restriction,
      ride_time: vc.ride_time ? parseInt(vc.ride_time) : undefined,
      need_helper: vc.need_helper,
      dnd_id: "suggested-vc-" + vc.id,
    })),
  ];

  const selectedIds = visiting.route_points.map((point) => point?.id);

  useEffect(() => {
    if (visiting.date) {
      fetchVisitingsCustomers(visiting.date);
    }
  }, [visiting.date]);

  const fetchVisitingsCustomers = (date: string) => {
    const url = "/visitings/visitings_customer_index";
    const params = {
      visiting_customer_search: {
        date: date,
      },
    };
    httpClient
      .get<ResponseVisitingsCustomerIndex>(url, { params })
      .then((res) => {
        setVisitingsCustomers(res.data.visitings_customers_except_self);
        setSelfVisitingsCustomers(res.data.visitings_customers_self || []);
        setAbsentCustomers(res.data.visitings_customers_absent || []);
      });
  };

  useEffect(() => {
    if (visiting.date) {
      fetchRequestingCustomers(visiting.date);
    }
  }, [visiting.date]);

  const fetchRequestingCustomers = async (date: string) => {
    const url = "/requested_customers";
    const params = {
      params: {
        date: date,
        only_one_day: true,
      },
    };
    const res = await httpClient.get<{
      requesting_customers: RequestedCustomer[];
    }>(url, params);
    setRequestingCustomers(res.data.requesting_customers);
  };

  const updateRouteData = (routeData: {
    route_points: Array<{ id: number; actual_time: string }>;
    departure_time: string;
    arrival_time: string;
    is_optimized_route?: boolean;
  }) => {
    setMapVersion((prev) => prev + 1);
    setVisiting((prev) => {
      const newRoutePoints = routeData.route_points
        .map((c) => {
          const point = prev.route_points.find((v) => v.id === c.id);
          if (point) {
            return {
              ...point,
              actual_time: c.actual_time,
            };
          }
        })
        .filter((point): point is RoutePoint => point !== undefined);
      return {
        ...prev,
        route_points: newRoutePoints,
        departure_time: routeData.departure_time,
        arrival_time: routeData.arrival_time,
        is_optimized_route: routeData.is_optimized_route,
      };
    });

    setAdjustmentTime(0);
  };

  const fetchDistanceRoute = async () => {
    const distanceRoute = await getDistanceRoute(visiting.id);
    updateRouteData(distanceRoute);
  };

  const changeAdjustmentTime = async (adjustmentTime: number) => {
    await putUpdateTime(visiting.id, visiting.route_points, adjustmentTime);
    fetchVisiting(adjustmentTime);
  };

  const handleUpdatePoints = async () => {
    try {
      const url = `/visitings/${visiting.id}/update_point`;
      const params = {
        point_update: {
          departure_point_id: visiting.departure_point_id,
          arrival_point_id: visiting.arrival_point_id,
        },
      };

      await httpClient.put(url, params);
      await putUpdateTime(visiting.id, visiting.route_points);

      setMapVersion((prev) => prev + 1);

      SuccessToast("地点を更新しました");
      fetchVisiting();
    } catch (error) {
      console.error(error);
      ErrorToast("更新に失敗しました");
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!active.id || !over?.id) return;
    setActiveId(active.id);

    if (
      visiting.route_points.find((v) => v.dnd_id === active.id) &&
      visiting.route_points.find((v) => v.dnd_id === over.id)
    ) {
      setVisiting((prev) => {
        const oldIndex = prev.route_points.findIndex(
          (point) => point.dnd_id === active.id,
        );
        const newIndex = prev.route_points.findIndex(
          (point) => point.dnd_id === over.id,
        );
        return {
          ...prev,
          route_points: arrayMove(prev.route_points, oldIndex, newIndex),
        };
      });
      return;
    } else if (!visiting.route_points.find((v) => v.dnd_id === active.id)) {
      const activeCustomer =
        visitingsCustomers
          .flatMap((group) => group.visitings_customers)
          .find((v) => "vc-" + v.id === active.id) ||
        suggestedCustomers.find((v) => "suggested-vc-" + v.id === active.id);
      if (!activeCustomer) return;
      const isSuggested = active.id.toString().startsWith("suggested-vc-");
      const addCustomer = {
        id: activeCustomer.id,
        display_name: activeCustomer.name,
        actual_time: activeCustomer.actual_time,
        soge_type: activeCustomer.soge_type,
        point_type: "VisitingsCustomer" as const,
        wc: activeCustomer.wc,
        order: 0,
        visiting_id: visiting.id,
        dnd_id: isSuggested
          ? "suggested-vc-" + activeCustomer.id
          : "vc-" + activeCustomer.id,
      };
      if (over.id === "soge") {
        setVisiting((prev) => ({
          ...prev,
          route_points: [addCustomer, ...prev.route_points],
        }));
        return;
      } else if (visiting.route_points.find((v) => v.dnd_id === over.id)) {
        setVisiting((prev) => {
          const newData: Visiting = {
            ...prev,
            route_points: [addCustomer, ...prev.route_points],
          };
          const oldIndex = newData.route_points.findIndex(
            (point) => point.dnd_id === active.id,
          );
          const newIndex = newData.route_points.findIndex(
            (point) => point.dnd_id === over.id,
          );
          return {
            ...prev,
            route_points: arrayMove(newData.route_points, oldIndex, newIndex),
          };
        });
      }
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!active.id) return;
    const activeRoutePoint = visiting.route_points.find(
      (v) => v.dnd_id === active.id,
    );
    const overRoutePoint = visiting.route_points.find(
      (v) => v.dnd_id === over?.id,
    );
    let newRoutePoints: RoutePoint[] = [];
    if (activeRoutePoint && overRoutePoint) {
      await new Promise((resolve) => {
        setVisiting((prev) => {
          const oldIndex = prev.route_points.findIndex(
            (point) => point.dnd_id === activeRoutePoint.dnd_id,
          );
          const newIndex = prev.route_points.findIndex(
            (point) => point.dnd_id === overRoutePoint.dnd_id,
          );
          newRoutePoints = arrayMove(prev.route_points, oldIndex, newIndex);
          resolve(newRoutePoints);
          return {
            ...prev,
            route_points: newRoutePoints,
          };
        });
        setActiveId(null);
        return;
      });
    } else {
      newRoutePoints = visiting.route_points;
      setActiveId(null);
    }
    await putUpdateTime(visiting.id, newRoutePoints);
    fetchVisiting();
    setMapVersion((prev) => prev + 1);
    fetchVisitingsCustomers(visiting.date);
    fetchRequestingCustomers(visiting.date);
  };

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 1,
    },
  });

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 150,
      tolerance: 5,
    },
  });
  const totalPassengers = visiting.route_points.reduce((sum, point) => {
    return sum + (point.passenger_count || 0);
  }, 0);

  const sensors = useSensors(mouseSensor, touchSensor);
  return (
    <>
      <DndContext
        collisionDetection={pointerWithin}
        sensors={sensors}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        measuring={{
          droppable: {
            strategy: MeasuringStrategy.Always,
          },
        }}
      >
        <div className="set">
          <div className="vehicle">
            <div className="head">
              <h2>
                <FontAwesomeIcon icon={faShuttleVan} />
                {visiting.car_name} {visiting.bin_order}便目
              </h2>
              <div className="selectbox">
                <button type="button" onClick={() => setOpenMap(true)}>
                  <FontAwesomeIcon icon={faMap} />
                  ルート表示
                </button>
              </div>
            </div>
            <dl>
              <dt>定員</dt>
              <dd>
                <span className="js-total-user">{visiting.max_seat}</span>
              </dd>
              <dt>車椅子</dt>
              <dd>
                <span className="js-total-wheelchair">
                  {visiting.max_wc_seat}
                </span>
              </dd>
              <dt>乗車人数</dt>
              <dd>
                <span className="js-ride-user">{totalPassengers}</span>
              </dd>
            </dl>
            {category === "welfare" && (
              <>
                <dl>
                  <dt>出発地点</dt>
                  <dd style={{ borderBottom: "none" }}>
                    <SelectField
                      name="departure_point_id"
                      label=""
                      value={visiting.departure_point_id}
                      options={pointsOptions}
                      setState={setVisiting}
                    />
                  </dd>
                </dl>
                <dl>
                  <dt>到着地点</dt>
                  <dd style={{ borderBottom: "none" }}>
                    <SelectField
                      name="arrival_point_id"
                      label=""
                      value={visiting.arrival_point_id}
                      options={pointsOptions}
                      setState={setVisiting}
                    />
                  </dd>
                  <div className="selectbox">
                    <button
                      type="button"
                      style={{ marginLeft: "20px", paddingRight: "13px" }}
                      onClick={handleUpdatePoints}
                    >
                      <FontAwesomeIcon icon={faSave} />
                      更新
                    </button>
                  </div>
                </dl>
              </>
            )}

            <div className="list js-tabs-cont">
              {openSeatForm ? (
                <div className="block active"></div>
              ) : (
                <div className="block active">
                  {visiting.route_points.length > 0 && (
                    <>
                      <div className="simulation">
                        <div className="set">
                          <div className="calculation">
                            <button
                              type="button"
                              aria-label={
                                visiting.is_optimized_route
                                  ? "最適ルート適用済み"
                                  : "ルート計算"
                              }
                              onClick={fetchDistanceRoute}
                              style={{
                                backgroundColor: visiting.is_optimized_route
                                  ? "#e0e0e0"
                                  : undefined,
                              }}
                            >
                              <FontAwesomeIcon
                                icon={
                                  visiting.is_optimized_route
                                    ? faCheckCircle
                                    : faRoute
                                }
                              />
                              {visiting.is_optimized_route
                                ? "最適ルート適用済み"
                                : "最適ルートに変更"}
                            </button>
                          </div>
                        </div>
                      </div>
                      <p className="start">
                        <span>出発</span>
                        <strong>{visiting.departure_time}</strong>
                        <label className="select">
                          <span>出発時間の調整：</span>
                          <select
                            value={adjustmentTime}
                            onChange={(e) =>
                              changeAdjustmentTime(Number(e.target.value))
                            }
                          >
                            {yotetimeAdjustOptions.map((option, index) => (
                              <option key={index} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </label>
                      </p>
                    </>
                  )}
                  <CustomerList
                    routePoints={visiting.route_points}
                    activeId={activeId}
                  />
                  <p className="end">
                    <span>到着</span>
                    <strong>{visiting.arrival_time}</strong>
                  </p>
                </div>
              )}
            </div>
          </div>

          {openMap ? (
            <RouteMap
              routeId={visiting.id}
              removeRouteMap={() => setOpenMap(false)}
              mapVersion={mapVersion}
            />
          ) : (
            <VisitingCustomers
              visitingsCustomers={visitingsCustomers}
              selfVisitingsCustomers={selfVisitingsCustomers}
              absentCustomers={absentCustomers}
              requestingCustomers={requestingCustomers}
              date={visiting.date}
              onSuggestedCustomersChange={setSuggestedCustomers}
            />
          )}
        </div>
        <Overlay
          activeId={activeId}
          customer={
            customersListWithVisitingsCustomers.find(
              (v) => v.dnd_id === activeId,
            ) as RoutePoint
          }
          selectedIds={selectedIds}
        />
      </DndContext>
    </>
  );
};

export default SogeForm;
