import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import InputField from "@/component/FormControls/InputField";
import CheckboxField from "@/component/FormControls/CheckboxField";
import RadioField from "@/component/FormControls/RadioField";
import UserAddressMap from "@/component/GoogleMap/UserAddressMap";
import HttpClient from "@/adapter/HttpClient";
import {
  SuccessToast,
  ErrorToast,
} from "@/component/ReactHotToast/ToastMessage";
import { GeocodingService } from "@/services/geocoding";
import { ResponseCarRestrictions } from "@/types/ApiResponse/carRestriction";
import { ResponseOfficeLatLng } from "@/types/ApiResponse/customer";
import { PointFormData, PointDetailApiResponse } from "@/types/point";

// font awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMapMarker,
  faExchangeAlt,
  faSearch,
  faUndoAlt,
  faSave,
} from "@fortawesome/free-solid-svg-icons";

import { ApiErrorHandler } from "@/services/apiErrorHandler";

const defaultPointFormValue: PointFormData = {
  address_label: "",
  address: "",
  postal_code: "",
  room_name: "",
  phone_number: "",
  lat: 0,
  lng: 0,
  wait_time: 0,
  car_restriction_id: 0,
  is_invalid: false,
};

type Props = {
  id?: string;
};

const PointForm = ({ id }: Props) => {
  const httpClient = new HttpClient();
  const router = useRouter();
  const [point, setPoint] = useState<PointFormData>(defaultPointFormValue);
  const [carRestrictionsOptions, setCarRestrictionsOptions] = useState<
    { label: string; value: number }[]
  >([]);
  const [officeLatLng, setOfficeLatLng] = useState<{
    lat: number;
    lng: number;
  }>({ lat: 35.681236, lng: 139.767125 });
  const [mapVersion] = useState<number>(0);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [pointFormErrorMessages, setPointFormErrorMessages] = useState<any>({});

  useEffect(() => {
    if (id) {
      fetchPoint(id);
    }
    fetchOfficeLatLng();
    fetchCarRestrictions();
  }, [id]);

  const fetchOfficeLatLng = () => {
    const url = "/customers/office_latlng";
    httpClient.get<ResponseOfficeLatLng>(url).then((response) => {
      const lat = Number(response.data.office_latlng.lat);
      const lng = Number(response.data.office_latlng.lng);
      setOfficeLatLng({ lat, lng });
    });
  };

  const fetchPoint = (id: string) => {
    const url = `/points/${id}`;
    httpClient
      .get<PointDetailApiResponse>(url)
      .then((response) => {
        setPoint(response.data.point);
      })
      .catch((error) => {
        if (error.response && error.response.status === 404) {
          ErrorToast("該当する地点が見つかりません");
        } else {
          ErrorToast("地点の取得に失敗しました");
        }
        router.push("/points");
      });
  };

  const fetchCarRestrictions = () => {
    const url = "/car_restrictions";
    httpClient
      .get<ResponseCarRestrictions>(url)
      .then((response) => {
        const carRestrictions = response.data.car_restrictions.map(
          (restriction) => {
            return { label: restriction.name, value: restriction.id };
          }
        );
        setCarRestrictionsOptions(carRestrictions);
      })
      .catch((error) => {
        ErrorToast("車両制限の取得に失敗しました");
        console.error(error);
      });
  };

  const handleGeocoding = async () => {
    if (!point.address) {
      setPointFormErrorMessages({
        address: "住所を入力してください",
      });
      return;
    }

    try {
      const geocodingService = new GeocodingService(httpClient);
      const result = await geocodingService.getCoordinatesFromAddress(
        point.address
      );
      setPoint((prev) => ({
        ...prev,
        postal_code: result.postcode as string,
        lat: result.lat,
        lng: result.lng,
      }));
      SuccessToast("住所情報を取得しました");
    } catch (error) {
      ErrorToast("住所情報の取得に失敗しました");
    }
  };

  const addLatLng = (lat: number, lng: number) => {
    setPoint((prev) => ({ ...prev, lat, lng }));
    setModalOpen(false);
  };

  const fetchAddressFromPostalCode = async () => {
    const postalCode = point.postal_code?.replace(/-/g, "").trim();

    if (!postalCode || postalCode.length !== 7) {
      setPointFormErrorMessages({
        postal_code: "郵便番号は7桁で入力してください",
      });
      return;
    }

    try {
      const response = await httpClient.get<{ address: string }>(
        `/post_codes/${postalCode}`
      );

      setPoint((prev) => ({
        ...prev,
        address: response.data.address,
      }));
    } catch (error: any) {
      alert("住所が見つかりませんでした");
    }
  };

  const handleSubmit = async () => {
    try {
      const pointForRequest = { ...point };

      if (id) {
        await httpClient.put(`/points/${id}`, pointForRequest);
        SuccessToast("地点を更新しました");
      } else {
        await httpClient.post("/points", pointForRequest);
        SuccessToast("地点を登録しました");
      }
      router.push("/points");
    } catch (error: any) {
      const errorMessages = new ApiErrorHandler(error).getErrorMessages();
      setPointFormErrorMessages(errorMessages);
    }
  };

  return (
    <>
      <section>
        <div className="inputSCT">
          <div className="cont">
            <div className="inputbox">
              <div className="set flex">
                <div className="head">
                  <h2>
                    <FontAwesomeIcon icon={faMapMarker} />
                    地点
                  </h2>
                  <button
                    type="button"
                    onClick={() => setModalOpen(true)}
                    disabled={!point.lat || !point.lng}
                    onMouseEnter={() =>
                      setTooltipVisible(!point.lat || !point.lng)
                    }
                    onMouseLeave={() => setTooltipVisible(false)}
                  >
                    <FontAwesomeIcon icon={faMapMarker} />
                    地図
                    {tooltipVisible && (
                      <div className="tooltip">緯度と経度の入力が必要です</div>
                    )}
                  </button>
                </div>
                <fieldset className="point flex">
                  <div className="flex">
                    <InputField
                      name="address_label"
                      label="地点名"
                      type="text"
                      labelClassName="text required"
                      inputClassName="middle"
                      value={point.address_label}
                      setState={setPoint}
                      errorMessage={
                        pointFormErrorMessages["address_label"] ?? ""
                      }
                    />
                  </div>
                  <div className="spacer"></div>
                  <InputField
                    name="postal_code"
                    label="〒"
                    type="text"
                    labelClassName="text required"
                    inputClassName="short"
                    value={point.postal_code}
                    setState={setPoint}
                    errorMessage={pointFormErrorMessages["postal_code"] ?? ""}
                  />
                  <button
                    type="button"
                    className="subsub js-addbutton"
                    onClick={fetchAddressFromPostalCode}
                  >
                    <FontAwesomeIcon icon={faExchangeAlt} />
                    〒→住所
                  </button>
                  <div className="spacer"></div>
                  <InputField
                    name="address"
                    label="住所"
                    type="text"
                    labelClassName="text required"
                    inputClassName="long"
                    value={point.address}
                    setState={setPoint}
                    errorMessage={pointFormErrorMessages["address"] ?? ""}
                  />
                  <button type="button" onClick={handleGeocoding} className="">
                    <FontAwesomeIcon icon={faSearch} />
                    API取得
                  </button>
                  <div className="spacer"></div>
                  <InputField
                    name="room_name"
                    label="マンション名・号室"
                    type="text"
                    labelClassName="text"
                    inputClassName="long"
                    value={point.room_name}
                    setState={setPoint}
                  />
                  <InputField
                    name="phone_number"
                    label="電話番号"
                    type="tel"
                    labelClassName="text"
                    inputClassName="middle"
                    value={point.phone_number}
                    setState={setPoint}
                  />
                  <div className="spacer"></div>
                  <InputField
                    name="lat"
                    label="地点緯度"
                    type="number"
                    labelClassName="text required"
                    inputClassName="middle"
                    value={point.lat}
                    setState={setPoint}
                    errorMessage={pointFormErrorMessages["lat"] ?? ""}
                  />
                  <InputField
                    name="lng"
                    label="地点経度"
                    type="number"
                    labelClassName="text required"
                    inputClassName="middle"
                    value={point.lng}
                    setState={setPoint}
                    errorMessage={pointFormErrorMessages["lng"] ?? ""}
                  />
                  <div className="spacer"></div>
                  <InputField
                    name="wait_time"
                    label="待ち時間"
                    type="number"
                    labelClassName="number"
                    inputClassName="short"
                    unitText="分"
                    value={point.wait_time}
                    setState={setPoint}
                  />
                  <div className="spacer"></div>
                  <CheckboxField
                    label="公開する"
                    checked={point.is_public || false}
                    setState={setPoint}
                    name="is_public"
                  />
                  <div className="spacer"></div>
                  <div className="limit">
                    <legend>車両制限</legend>
                    <RadioField
                      inputName="limit0"
                      name="car_restriction_id"
                      value={point.car_restriction_id}
                      setState={setPoint}
                      options={carRestrictionsOptions}
                    />
                  </div>
                </fieldset>
              </div>

              <div className="stop">
                <h4>停止設定</h4>
                <CheckboxField
                  label="無効化する"
                  checked={point.is_invalid || false}
                  setState={setPoint}
                  name="is_invalid"
                />
              </div>

              <div className="submitbox">
                <Link href="/points">
                  <button type="button" aria-label="戻る" className="sub">
                    <FontAwesomeIcon icon={faUndoAlt} />
                    戻る
                  </button>
                </Link>
                <button type="button" onClick={handleSubmit}>
                  <FontAwesomeIcon icon={faSave} />
                  登録
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
      {modalOpen && (
        <div className="modalSCT active">
          <div className="mask"></div>
          <div className="cont">
            <div className="close" onClick={() => setModalOpen(false)}></div>
            <UserAddressMap
              officeLatLng={officeLatLng}
              addressPosition={{
                lat: Number(point.lat),
                lng: Number(point.lng),
              }}
              mapVersion={mapVersion}
              submitFunction={addLatLng}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default PointForm;
