import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import HttpClient from "@/adapter/HttpClient";
import moment from "moment";

import InputField from "@/component/FormControls/InputField";
import CustomerTable from "@/component/soge/Index/CustomerTable";
import VisitingCustomers from "@/component/soge/VisitingCustomers";
import Overlay from "@/component/soge/Index/Overlay";
import putUpdateTime from "@/component/soge/Requests/putUpdateTime";
import postNewData from "@/component/soge/Requests/postNewData";
import DriverModal from "@/component/soge/Index/DriverModal";
import isValidDate from "@/component/Widgets/isValidDate";
import RouteMap from "@/component/soge/Index/RouteMap";
import ReplicateSection from "@/component/soge/Index/ReplicateSection";
import MessageDisplay from "@/component/soge/Index/MessageDisplay";
import RequestedCustomer from "@/types/requestedCustomer";
import { SuccessToast } from "@/component/ReactHotToast/ToastMessage";

// context
import { useUser } from "@/contexts/UserContext";
// types
import {
  VisitingsCustomer,
  AbsentCustomer,
  SelfVisitingsCustomer,
} from "@/types/visitingsCustomer";
import { VisitingGroup, RoutePoint } from "@/types/soge";
import { ResponseVisitingIndex } from "@/types/ApiResponse/visiting";
import { Car } from "@/types/car";
import { MessageItem } from "@/component/soge/Index/MessageDisplay";
import { ResponseVisitingsCustomerIndex } from "@/types/ApiResponse/soge";

// dnd-kit
import {
  DndContext,
  DragOverEvent,
  Active,
  Over,
  pointerWithin,
  MeasuringStrategy,
  useSensor,
  MouseSensor,
  TouchSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";

// font awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPrint, faUpload } from "@fortawesome/free-solid-svg-icons";

const empty_bin = {
  id: undefined,
  new_id: undefined,
  car_id: undefined,
  order: undefined,
  start_time: undefined,
  end_time: undefined,
  status: undefined,
  user_count: undefined,
  wheelchair_count: undefined,
  briefcase_count: undefined,
  driver_name: undefined,
  tenjo_name: undefined,
  users: [],
};

type Props = {
  date: string;
  setDate: (date: string) => void;
  shareKey?: number;
  onSubmit?: () => void;
};

const TableArea = ({ date, setDate, shareKey, onSubmit }: Props) => {
  const httpClient = new HttpClient();
  const router = useRouter();
  const { category } = useUser();
  const [visitingsGroups, setVisitingsGroups] = useState<VisitingGroup[][]>([
    [],
  ]);

  const [visitingsCustomers, setVisitingsCustomers] = useState<
    {office_name: string, visitings_customers: VisitingsCustomer[]}[]
  >([]);
  const [selfVisitingsCustomers, setSelfVisitingsCustomers] = useState<
    SelfVisitingsCustomer[]
  >([]);
  const [requestingCustomers, setRequestingCustomers] = useState<
    RequestedCustomer[]
  >([]);
  const [absentCustomers, setAbsentCustomers] = useState<AbsentCustomer[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [activeId, setActiveId] = useState<number | string | null>(null);
  const [overBinId, setOverBinId] = useState<number | string | null>(null);
  const [canSort, setCanSort] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [visitingId, setVisitingId] = useState<number>(); // モーダルで選択された便のID
  const [openMap, setOpenMap] = useState(false);
  const [routeId, setRouteId] = useState<number>();
  const [mapVersion, setMapVersion] = useState(0);
  const [messagesGroup, setMessagesGroup] = useState<MessageItem[]>([]);
  const [suggestedCustomers, setSuggestedCustomers] = useState<
    VisitingsCustomer[]
  >([]);

  // customersListは全ての便内のroute_pointsの配列
  const customersList = visitingsGroups.flatMap((bins) =>
    bins.flatMap((bin) => bin?.route_points || [])
  );
  // customersListWithVisitingsCustomersは全ての便内のroute_pointsの配列とvisitingsCustomersの配列を合わせた配列
  const customersListWithVisitingsCustomers: RoutePoint[] = [
    ...customersList,
    ...visitingsCustomers.flatMap((group) => group.visitings_customers.map((vc) => ({
      id: vc.id,
      display_name: vc.name,
      order: 0,
      actual_time: vc.actual_time,
      soge_type: vc.soge_type,
      point_type: "VisitingsCustomer" as const,
      wc: vc.wc,
      visiting_id: vc.visiting_id,
      note: vc.remarks,
      passenger_count: vc.passenger_count,
      address: vc.address,
      dnd_id: "vc-" + vc.id,
    }))),
    ...suggestedCustomers.map((vc) => ({
      id: vc.id,
      display_name: vc.name,
      order: 0,
      actual_time: vc.actual_time,
      soge_type: vc.soge_type,
      point_type: "VisitingsCustomer" as const,
      wc: vc.wc,
      visiting_id: vc.visiting_id,
      note: vc.remarks,
      passenger_count: vc.passenger_count,
      address: vc.address,
      dnd_id: "suggested-vc-" + vc.id,
    })),
  ];

  useEffect(() => {
    if (date) {
      fetchVisitings();
      fetchVisitingsCustomers();
    }
  }, [date]);

  const handleShareToOffices = useCallback(async () => {
    let url = "";
    if (category === "education") {
      url = "/education/visitings/share_to_office";
    } else {
      url = "/visitings/share_to_office";
    }

    const visitingIds = visitingsGroups
      .flat()
      .filter((bin) => bin?.id)
      .map((bin) => bin.id as number);

    const params = {
      date,
      visiting_ids: visitingIds,
    };

    const res = await httpClient.post<{ message: string }>(url, params);
    if (res.data.message) {
      SuccessToast(res.data.message);
    }
    fetchVisitings();
  }, [visitingsGroups, date, category]);

  useEffect(() => {
    if (shareKey !== undefined && shareKey > 0) {
      handleShareToOffices();
    }
  }, [shareKey]);

  const fetchVisitings = async () => {
    const url = "/visitings";
    const params = {
      visiting_search: {
        date: date,
      },
    };
    const res = await httpClient.get<ResponseVisitingIndex>(url, { params });
    setVisitingsGroups(res.data.visitings_groups);
    setRequestingCustomers(res.data.requesting_customers);
    setCars(res.data.cars);
    setMapVersion((prev) => prev + 1);

    setMessagesGroup(
      res.data.alerts?.map((alert) => ({
        messages: alert.messages,
      })) || []
    );
  };

  const fetchVisitingsCustomers = async () => {
    const url = "/visitings/visitings_customer_index";
    const params = {
      visiting_customer_search: {
        date: date,
      },
    };
    const res = await httpClient.get<ResponseVisitingsCustomerIndex>(url, { params });
    setVisitingsCustomers(res.data.visitings_customers_except_self);
    setSelfVisitingsCustomers(res.data.visitings_customers_self || []);
    setAbsentCustomers(res.data.visitings_customers_absent || []);
  };

  const openDriverModal = (visitingId: number) => {
    setOpenModal(true);
    setVisitingId(visitingId);
  };

  // ドラッグ&ドロップ操作で、ドロップ先の便を特定
  const findAndSetOverBinId = (
    overId: string | number,
    overBin: any,
    overUser: any
  ) => {
    if (overBin) {
      setOverBinId(overBin.id);
    } else if (overUser) {
      const overBin = visitingsGroups
        .flat()
        .find((v) => v?.new_id === overUser?.bin_id);

      setOverBinId(overBin?.new_id as string);
    } else {
      setOverBinId(overId);
    }
  };

  const setDragAndDropTargetValue = (active: Active, over: Over) => {
    const activeId = active.id;
    const overId = over.id;
    const activeUser = customersListWithVisitingsCustomers.find(
      (v) => v.dnd_id === activeId
    );
    const overUser = customersListWithVisitingsCustomers.find(
      (v) => v.dnd_id === overId
    );
    let activeBin = undefined;
    let overBin = undefined;
    if (activeUser) {
      activeBin = visitingsGroups
        .flat()
        .find((v) => v?.id === activeUser?.visiting_id);
    }
    if (overUser) {
      overBin = visitingsGroups
        .flat()
        .find((v) => v?.id === overUser?.visiting_id);
    }
    // overUserが存在しない場合、overIdが既存のbinのIDかどうかをチェック
    if (!overBin && !overUser) {
      overBin = visitingsGroups
        .flat()
        .find((v) => v?.id === overId || v?.new_id === overId);
    }

    return { activeId, overId, activeBin, overBin, activeUser, overUser };
  };

  // ドラッグ中に同じ便内であれば並び替えデザインを許可、overのbinもset
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!active.id || !over?.id) return; // overが存在しない場合はeary return
    setActiveId(active.id);

    // ドラッグ中の要素の値を取得
    const { activeId, overId, activeBin, overBin, activeUser, overUser } =
      setDragAndDropTargetValue(active, over);

    // VPの便間移動を防ぐ
    if (activeUser && activeUser.point_type === "VisitingsPoint") {
      if (activeBin && overBin && activeBin !== overBin) {
        setCanSort(false);
        return;
      }
      // VPが空の便エリアに移動しようとしている場合も制限
      if (activeBin && !overBin && !overUser) {
        setCanSort(false);
        return;
      }
    }

    // over先の要素を設定
    findAndSetOverBinId(overId, overBin, overUser);

    //既存の便内で並び替えでは並び替えデザインを許可
    if (activeBin && overBin && activeBin === overBin) {
      setCanSort(true);
      return;
    }
    // 新しく作成された便内で並び替えでは並び替えデザインを許可
    if (activeUser && overUser && !activeBin && !overBin) {
      const activeBin = visitingsGroups
        .flat()
        .find((v) => v?.new_id === String(activeUser.visiting_id));
      const overBin = visitingsGroups
        .flat()
        .find((v) => v?.new_id === String(overUser.visiting_id));
      if (activeBin && overBin && activeBin === overBin) {
        setCanSort(true);
        return;
      }
    }
    setCanSort(false);
  };

  // ドラッグ終了後の処理 テスト的にloading画面を差し込んでいる
  const resetActiveId = () => {
    setActiveId(null);
    setCanSort(false);
  };

  const moveCustomerToVisiting = async (
    overId: number | string | undefined,
    overBin: VisitingGroup | undefined,
    activeUser: RoutePoint | undefined,
    overUser: RoutePoint | undefined
  ) => {
    let newOverBinCustomers: RoutePoint[] = [];

    if (activeUser && overBin) {
      await new Promise((resolve) =>
        setVisitingsGroups((prev) => {
          const newBins = [...prev];
          // 対象の便に利用者を追加
          const routePoint: RoutePoint = {
            ...activeUser,
            visiting_id: Number(overBin.id),
          };
          overBin.route_points.push(routePoint);
          const overRowIndex = overBin.bin_order - 1;
          const overColIndex = newBins[overRowIndex].findIndex(
            (bin) => bin?.id === overBin.id
          );
          newBins[overRowIndex][overColIndex] = overBin;

          newOverBinCustomers = overBin.route_points;
          resolve(newBins);
          return newBins;
        })
      );
      resetActiveId();
      await putUpdateTime(overBin.id, newOverBinCustomers);
      fetchVisitings();
      fetchVisitingsCustomers();
      return;
    }

    // 利用者一覧から利用者をドラッグして、空の便エリアにドロップした場合//
    if (activeUser && !overUser && !overBin) {
      const overIdString = String(overId);
      const orderIndex = Number(overIdString.split("-")[0]);
      const carIndex = Number(overIdString.split("-")[1]);
      await new Promise((resolve) =>
        setVisitingsGroups((prev) => {
          const newBins = [...prev];
          // 対象の便に利用者を追加
          const routePoint: RoutePoint = {
            ...activeUser,
            visiting_id: overId,
          };

          newBins[orderIndex][carIndex] = {
            ...empty_bin,
            new_id: String(overId),
            bin_order: orderIndex + 1,
            car_id: cars[carIndex].id as number,
            route_points: [routePoint],
          };
          newOverBinCustomers = [routePoint];
          resolve(newBins);
          return newBins;
        })
      );
      resetActiveId();
      await postNewData(
        date,
        cars[carIndex].id as number,
        orderIndex + 1,
        newOverBinCustomers
      );
      fetchVisitings();
      fetchVisitingsCustomers();
      return;
    }
  };

  const handleDragEnd = async (event: DragOverEvent) => {
    // はじめに、overBinIdをundefinedにする
    setOverBinId(null);
    const { active, over } = event;
    if (!active.id || !over?.id) {
      resetActiveId();
      return;
    }

    // ドラッグ中の要素の値を取得
    const { activeId, overId, activeBin, overBin, activeUser, overUser } =
      setDragAndDropTargetValue(active, over);

    // VPの便間移動を防ぐ
    if (activeUser && activeUser.point_type === "VisitingsPoint") {
      if (activeBin && overBin && activeBin !== overBin) {
        resetActiveId();
        return;
      }
      // VPが空の便エリアに移動しようとしている場合も制限
      if (activeBin && !overBin && !overUser) {
        resetActiveId();
        return;
      }
    }

    // 利用者一覧から、visitingに移動する処理
    if (!customersList.find((v) => v.dnd_id === activeId)) {
      moveCustomerToVisiting(overId, overBin, activeUser, overUser);
      resetActiveId();
      return;
    }

    let newActiveBinRoutePoints: RoutePoint[] = [];
    let newOverBinRoutePoints: RoutePoint[] = [];

    // パターン1 既存の便内で並び替え
    if (
      activeUser &&
      overUser &&
      activeBin &&
      overBin &&
      activeBin === overBin
    ) {
      await new Promise((resolve) =>
        setVisitingsGroups((prev) => {
          const newBins = [...prev];
          const newRoutePoints = arrayMove(
            activeBin.route_points,
            activeBin.route_points.findIndex((v) => v.id === activeUser.id),
            activeBin.route_points.findIndex((v) => v.id === overUser.id)
          );
          activeBin.route_points = newRoutePoints;
          const rowIndex = activeBin.bin_order - 1;
          const colIndex = newBins[rowIndex].findIndex(
            (bin) => bin?.id === activeBin.id
          );
          newBins[rowIndex][colIndex] = activeBin;

          newActiveBinRoutePoints = newRoutePoints;

          resolve(newBins);
          return newBins;
        })
      );
      resetActiveId();
      // 並び替え後の利用者を更新
      await putUpdateTime(activeBin.id, newActiveBinRoutePoints);
      fetchVisitings();
      return;
    }

    // パターン2 既存の便から異なる便へ挿入、並び替え
    if (
      activeUser &&
      activeBin &&
      overBin &&
      activeBin !== overBin
    ) {
      await new Promise((resolve) =>
        setVisitingsGroups((prev) => {
          const newBins = [...prev];

          activeBin.route_points = activeBin.route_points.filter(
            (v) => v.id !== activeUser.id
          );
          const activeRowIndex = activeBin.bin_order - 1;
          const activeColIndex = newBins[activeRowIndex].findIndex(
            (bin) => bin?.id === activeBin.id
          );
          newBins[activeRowIndex][activeColIndex] = activeBin;
          newActiveBinRoutePoints = activeBin.route_points;

          // 対象の便に利用者を追加
          overBin.route_points.push({
            ...activeUser,
            visiting_id: Number(overBin.id),
          });
          const overRowIndex = overBin.bin_order - 1;
          const overColIndex = newBins[overRowIndex].findIndex(
            (bin) => bin?.id === overBin.id
          );
          newBins[overRowIndex][overColIndex] = overBin;
          newOverBinRoutePoints = overBin.route_points;
          resolve(newBins);

          return newBins;
        })
      );
      resetActiveId();
      // ドラッグ&ドロップ元の利用者を更新
      await putUpdateTime(activeBin.id, newActiveBinRoutePoints);
      // ドラッグ&ドロップ先の利用者を更新
      await putUpdateTime(overBin.id, newOverBinRoutePoints);
      fetchVisitings();
      return;
    }

    // パターン3 移動先が空の場合、新しく便を作成し、利用者を追加
    if (activeUser && !overUser && activeBin && !overBin) {
      const overIdString = String(overId);
      const orderIndex = Number(overIdString.split("-")[0]);
      const carIndex = Number(overIdString.split("-")[1]);
      await new Promise((resolve) =>
        setVisitingsGroups((prev) => {
          const newBins = [...prev];

          activeBin.route_points = activeBin.route_points.filter(
            (v) => v.id !== activeUser.id
          );

          const activeRowIndex = activeBin.bin_order - 1;
          const activeColIndex = newBins[activeRowIndex].findIndex(
            (bin) => bin?.id === activeBin.id
          );
          newBins[activeRowIndex][activeColIndex] = activeBin;
          newActiveBinRoutePoints = activeBin.route_points;

          const newCustomer = [{ ...activeUser, visiting_id: overId }];
          // 対象の便に利用者を追加
          newBins[orderIndex][carIndex] = {
            ...empty_bin,
            new_id: String(overId),
            bin_order: orderIndex + 1,
            car_id: cars[carIndex].id as number,
            route_points: newCustomer,
          };
          newOverBinRoutePoints = newCustomer;
          resolve(newBins);
          return newBins;
        })
      );
      resetActiveId();
      // ドラッグ&ドロップ元の利用者を更新
      await putUpdateTime(activeBin.id, newActiveBinRoutePoints);
      // ドラッグ&ドロップ先の便の作成と利用者の追加
      await postNewData(
        date,
        cars[carIndex].id as number,
        orderIndex + 1,
        newOverBinRoutePoints
      );
      fetchVisitings();
      return;
    }

    resetActiveId();
  };

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
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

  const sensors = useSensors(mouseSensor, touchSensor);

  const onClickMap = (visitingId: number) => {
    setOpenMap(true);
    setRouteId(visitingId);
    setMapVersion((prev) => prev + 1);
  };

  const removeRouteMap = () => {
    setOpenMap(false);
    setRouteId(undefined);
  };

  const moveToPrint = () => {
    router.push({
      pathname: "/soge/print",
      query: { date },
    });
  };

  const handleReplicateSuccess = () => {
    fetchVisitings();
    fetchVisitingsCustomers();
  };

  return (
    <>
      <MessageDisplay messagesGroup={messagesGroup} />

      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        measuring={{
          droppable: {
            strategy: MeasuringStrategy.Always,
          },
        }}
      >
        <div className={`viewArea ${activeId ? "" : "active"}`}>
          <div className="mainArea">
            <section>
              <div className="panelSCT">
                <div className="cont">
                  <div className="head" style={{ display: "flex", justifyContent: "space-between" }}>
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
                      <ReplicateSection
                        date={date}
                        onReplicateSuccess={handleReplicateSuccess}
                      />
                    </div>
                    <div className="selectbox">
                      {onSubmit && (
                        <button type="button" aria-label="登録" onClick={onSubmit} style={{ marginLeft: 'auto', flexShrink: 0 }}>
                          <FontAwesomeIcon icon={faUpload} />
                          確定
                        </button>
                      )}
                    </div>
                  </div>
                  <CustomerTable
                    visitingsGroups={visitingsGroups}
                    setVisitingsGroups={setVisitingsGroups}
                    cars={cars}
                    activeId={activeId}
                    canSort={canSort}
                    overBinId={overBinId}
                    customersList={customersList}
                    date={date}
                    openDriverModal={openDriverModal}
                    onClickMap={onClickMap}
                    setMapVersion={setMapVersion}
                    fetchVisitingsCustomers={fetchVisitingsCustomers}
                    fetchVisitings={fetchVisitings}
                  />
                </div>
              </div>
            </section>
          </div>
          {openMap ? (
            <div className="subArea">
              <section>
                <div className="transferSCT" style={{ paddingRight: "0px" }}>
                  <div className="cont">
                    <RouteMap
                      routeId={routeId as number}
                      removeRouteMap={removeRouteMap}
                      mapVersion={mapVersion}
                    />
                  </div>
                </div>
              </section>
            </div>
          ) : (
            <VisitingCustomers
              visitingsCustomers={visitingsCustomers}
              selfVisitingsCustomers={selfVisitingsCustomers}
              absentCustomers={absentCustomers}
              requestingCustomers={requestingCustomers}
              date={date}
              onSuggestedCustomersChange={setSuggestedCustomers}
            />
          )}
        </div>
        <Overlay
          customer={
            customersListWithVisitingsCustomers.find(
              (v) => v.dnd_id === activeId
            )
          }
          selectedIds={customersList.map((v) => v.id)}
          activeId={activeId}
        />
      </DndContext>
      {visitingId && openModal && (
        <DriverModal
          visitingId={visitingId}
          openModal={openModal}
          setOpenModal={setOpenModal}
          fetchVisiting={fetchVisitings}
        />
      )}
    </>
  );
};

export default TableArea;
