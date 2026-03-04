import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import HttpClient from "@/adapter/HttpClient";
import Link from "next/link";
import InputField from "@/component/FormControls/InputField";
import SogeForm from "@/component/soge/Form";
import TourismSogeForm from "@/component/soge/Tourism/Soge/Form";
import DriverModal from "@/component/soge/Index/DriverModal";

// types
import { Visiting, TourismVisiting } from "@/types/visiting";
import {
  ResponseVisiting,
  ResponsePointsOptions,
  ResponseTourismVisiting,
} from "@/types/ApiResponse/visiting";
import { SelectOption } from "@/types/FormControll/selectOption";

// context
import { useUser } from "@/contexts/UserContext";

// fontawesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarPlus,
  faThLarge,
  faThList,
  faSave,
} from "@fortawesome/free-solid-svg-icons";

const NewSogePage = () => {
  const httpClient = new HttpClient();
  const router = useRouter();
  const { category, officeName } = useUser();
  const { id, date } = router.query;
  const [visiting, setVisiting] = useState<Visiting>({
    id: 0,
    date: (date as string) || "",
    car_id: 0,
    car_name: "",
    bin_order: 0,
    driver_id: 0,
    tenjo_id: 0,
    departure_time: "",
    arrival_time: "",
    total_customers: 0,
    total_wheelchair: 0,
    total_cargo_volume: 0,
    use_passenger_seat: false,
    customers: [],
    route_points: [],
    base_points: [],
    departure_point_id: undefined,
    arrival_point_id: undefined,
  });

  const [tourismVisiting, setTourismVisiting] = useState<TourismVisiting>({
    id: 0,
    date: (date as string) || "",
    car_id: 0,
    car_name: "",
    bin_order: 0,
    driver_id: 0,
    tenjo_id: 0,
    departure_time: "",
    arrival_time: "",
    total_customers: 0,
    total_wheelchair: 0,
    total_cargo_volume: 0,
    use_passenger_seat: false,
    customers: [],
    route_points: [],
    base_points: [],
    departure_point_id: undefined,
    arrival_point_id: undefined,
  });
  const [adjustmentTime, setAdjustmentTime] = useState(0);
  const [openModal, setOpenModal] = useState(false);
  const [pointsOptions, setPointsOptions] = useState<SelectOption[]>([]);

  useEffect(() => {
    if (id) {
      fetchVisiting();
      getPointsOptions();
    }
  }, [id]);

  const fetchVisiting = async (adjustmentTime?: number) => {
    const url = category === "tourism" ? "/tourism/visitings" : "/visitings";
    try {
      if (category === "tourism") {
        const res = await httpClient.get<ResponseTourismVisiting>(
          `${url}/${id}`
        );
        setTourismVisiting(res.data.visiting);
      } else {
        const res = await httpClient.get<ResponseVisiting>(`${url}/${id}`);
        setVisiting(res.data.visiting);
      }
    } catch (error) {
      console.log(error);
      moveToIndex();
    }
  };

  const getPointsOptions = () => {
    const url = "/visitings/point_options";
    httpClient
      .get<ResponsePointsOptions>(url)
      .then((res) => {
        setPointsOptions(res.data.point_options);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const moveToIndex = () => {
    const currentDate =
      visiting.date || tourismVisiting.date || (date as string);
    router.push("/soge?date=" + currentDate);
  };

  return (
    <div id="contents">
      <section>
        <div className="headSCT">
          <div className="cont">
            <h1>
              <FontAwesomeIcon icon={faCalendarPlus} />
              送迎登録
            </h1>
            <ul className="button">
              <li>
                <Link href={{ pathname: "/soge" }}>
                  <FontAwesomeIcon icon={faThLarge} />
                  送迎一覧
                </Link>
              </li>
            </ul>
            {officeName && (
              <div className="officeNameDisplay">
                {officeName}
              </div>
            )}
          </div>
        </div>
      </section>
      <section>
        <div className="transferSCT">
          <div className="cont">
            <div className="date">
              <div className="selectbox">
                <label className="date">
                  <InputField
                    type="date"
                    label="日付："
                    value={visiting?.date}
                    setState={setVisiting}
                    readOnly={true}
                  />
                </label>
              </div>
            </div>
            {(visiting.id || tourismVisiting.id) && (
              <>
                {category === "tourism" ? (
                  <TourismSogeForm
                    visiting={tourismVisiting}
                    setVisiting={setTourismVisiting}
                    fetchVisiting={fetchVisiting}
                    adjustmentTime={adjustmentTime}
                    setAdjustmentTime={setAdjustmentTime}
                    pointsOptions={pointsOptions}
                  />
                ) : (
                  <SogeForm
                    visiting={visiting}
                    setVisiting={setVisiting}
                    fetchVisiting={fetchVisiting}
                    adjustmentTime={adjustmentTime}
                    setAdjustmentTime={setAdjustmentTime}
                    pointsOptions={pointsOptions}
                  />
                )}
              </>
            )}
            {/* <div className="pattern">
              <div className="searchbox">
                <label className="checkbox">
                  <input type="checkbox" />
                  <span>
                    曜日パターン登録する
                    <strong className="js-dayOfWeek"></strong>
                  </span>
                </label>
              </div>
            </div> */}

            <div className="submitbox">
              <div>
                <button
                  type="button"
                  aria-label="運転手・添乗員登録"
                  onClick={() => setOpenModal(true)}
                >
                  <FontAwesomeIcon icon={faSave} />
                  運転手・添乗員登録
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
      {(visiting.id || tourismVisiting.id) && openModal && (
        <DriverModal
          visitingId={visiting.id}
          openModal={openModal}
          setOpenModal={setOpenModal}
          fetchVisiting={fetchVisiting}
          moveToIndex={moveToIndex}
        />
      )}
    </div>
  );
};

export default NewSogePage;
