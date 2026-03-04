import React, { useState } from "react";
import InputField from "@/component/FormControls/InputField";
import RadioField from "../FormControls/RadioField";
import UserAddressMap from "@/component/GoogleMap/UserAddressMap";
import HttpClient from "@/adapter/HttpClient";
import {
  SuccessToast,
  ErrorToast,
} from "@/component/ReactHotToast/ToastMessage";
import { GeocodingService } from "@/services/geocoding";

//types
import { Address } from "@/types/address";

// font awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMapMarker,
  faExchangeAlt,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";

type Props = {
  address: Address;
  index: number;
  setAddresses: React.Dispatch<React.SetStateAction<Address[]>>;
  carRestrictionsOptions: { label: string; value: number }[];
  officeLatLng: { lat: number; lng: number };
  id?: string;
  errorMessages?: any;
};

const AddressesFormField = ({
  address,
  index,
  setAddresses,
  carRestrictionsOptions,
  officeLatLng,
  errorMessages = {},
}: Props) => {
  const [mapVersion] = useState<number>(0);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const latlng = { lat: Number(address.lat), lng: Number(address.lng) };

  const httpClient = new HttpClient();
  const geocodingService = new GeocodingService(httpClient);

  const [tooltipVisible, setTooltipVisible] = useState(false);

  const handleGeocoding = async () => {
    if (!address.address) {
      ErrorToast("住所を入力してください");
      return;
    }

    try {
      const result = await geocodingService.getCoordinatesFromAddress(
        address.address
      );
      setAddresses((prev: any) => {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          postal_code: result.postcode as string,
          lat: result.lat,
          lng: result.lng,
        };
        return updated;
      });
      SuccessToast("住所情報を取得しました");
    } catch (error) {
      ErrorToast("住所情報の取得に失敗しました");
    }
  };

  const addLatLng = (lat: number, lng: number) => {
    setAddresses((prev: any) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], lat, lng };
      return updated;
    });
    setModalOpen(false);
  };

  const fetchAddressFromPostalCode = async () => {
    const postalCode = address.postal_code?.replace(/-/g, "").trim();

    if (!postalCode || postalCode.length !== 7) {
      alert("郵便番号は7桁で入力してください");
      return;
    }

    try {
      const httpClient = new HttpClient();
      const response = await httpClient.get<{ address: string }>(
        `/post_codes/${postalCode}`
      );

      const updatedAddress = { ...address, address: response.data.address };

      setAddresses((prev: any) => {
        const updated = [...prev];
        updated[index] = updatedAddress;
        return updated;
      });
    } catch (error: any) {
      alert("住所が見つかりませんでした");
    }
  };

  return (
    <>
      <div className="set flex">
        <div className="head">
          <h2>
            <FontAwesomeIcon icon={faMapMarker} />
            <span className="js-point-txt">
              {address.address_label
                ? address.address_label
                : `地点(${address.order})`}
            </span>
          </h2>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            disabled={!address.lat || !address.lng}
            onMouseEnter={() => setTooltipVisible(!address.lat || !address.lng)}
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
              index={index}
              name="address_label"
              label="地点名"
              type="text"
              labelClassName="text required"
              inputClassName="short"
              value={address.address_label}
              setState={setAddresses}
              errorMessage={
                errorMessages[`addresses[${index}].address_label`] ?? ""
              }
            />
          </div>
          <div className="spacer"></div>
          <InputField
            index={index}
            name="postal_code"
            label="〒"
            type="text"
            labelClassName="text required"
            inputClassName="short"
            value={address.postal_code}
            setState={setAddresses}
            errorMessage={
              errorMessages[`addresses[${index}].postal_code`] ?? ""
            }
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
            index={index}
            name="address"
            label="住所"
            type="text"
            labelClassName="text required"
            inputClassName="long"
            value={address.address}
            setState={setAddresses}
            errorMessage={errorMessages[`addresses[${index}].address`] ?? ""}
          />
          <button type="button" onClick={handleGeocoding} className="">
            <FontAwesomeIcon icon={faSearch} />
            API取得
          </button>
          <div className="spacer"></div>
          <InputField
            index={index}
            name="room_name"
            label="マンション名・号室"
            type="text"
            labelClassName="text"
            inputClassName="long"
            value={address.room_name}
            setState={setAddresses}
          />
          <InputField
            index={index}
            name="phone_number"
            label="電話番号"
            type="tel"
            labelClassName="text"
            inputClassName="middle"
            value={address.phone_number}
            setState={setAddresses}
          />
          <div className="spacer"></div>
          <InputField
            index={index}
            name="lat"
            label="地点緯度"
            type="number"
            labelClassName="text required"
            inputClassName="middle"
            value={address.lat}
            setState={setAddresses}
            errorMessage={errorMessages[`addresses[${index}].lat`] ?? ""}
          />
          <InputField
            index={index}
            name="lng"
            label="地点経度"
            type="number"
            labelClassName="text required"
            inputClassName="middle"
            value={address.lng}
            setState={setAddresses}
            errorMessage={errorMessages[`addresses[${index}].lng`] ?? ""}
          />
          <div className="spacer"></div>
          {/* <InputField
          index={index}
          name="parking_lat"
          label="停車緯度"
          type="text"
          labelClassName="text"
          inputClassName="middle"
          value={address.parking_lat}
          setState={setAddresses}
        />
        <InputField
          index={index}
          name="parking_lng"
          label="停車経度"
          type="text"
          labelClassName="text"
          inputClassName="middle"
          value={address.parking_lng}
          setState={setAddresses}
        /> */}
          {/* <div className="spacer"></div>
          <InputField
            index={index}
            name="distance"
            label="距離"
            type="text"
            labelClassName="text"
            inputClassName="middle"
            unitText="km"
            value={address.distance}
            setState={setAddresses}
          />
          <InputField
            index={index}
            name="time"
            label="時間"
            type="number"
            labelClassName="number"
            inputClassName="middle"
            unitText="分"
            value={address.time}
            setState={setAddresses}
          /> */}
          <InputField
            index={index}
            name="wait_time"
            label="待ち時間"
            type="number"
            labelClassName="number"
            inputClassName="short"
            unitText="分"
            value={address.wait_time}
            setState={setAddresses}
          />
          {/* <InputField
          index={index}
          name="acceptance_rate"
          label="許容率"
          type="number"
          labelClassName="number"
          inputClassName="short"
          unitText="%"
          value={address.acceptance_rate}
          setState={setAddresses}
        /> */}
          <div className="spacer"></div>
          {/* <label className="checkbutton">
          <input type="checkbox" />
          <span className="subsub">
            <FontAwesomeIcon icon={faRoute} /> 誘導経路登録
          </span>
        </label>
        <label className="checkbutton">
          <input type="checkbox" />
          <span className="subsub">単独ルート登録（迎え）</span>
        </label>
        <label className="checkbutton js-separate-hide">
          <input type="checkbox" />
          <span className="subsub">単独ルート登録（送り）</span>
        </label> */}
          <div className="spacer"></div>
          <div className="limit">
            <legend className="required">
              <span>車両制限</span>
            </legend>
            <RadioField
              inputName={`limit${index}`}
              name="car_restriction_id"
              index={index}
              value={address.car_restriction_id}
              setState={setAddresses}
              options={carRestrictionsOptions}
              errorMessage={
                errorMessages[`addresses[${index}].car_restriction_id`] ?? ""
              }
            />
          </div>
        </fieldset>
      </div>
      {modalOpen && (
        <div className="modalSCT active">
          <div className="mask"></div>
          <div className="cont">
            <div className="close" onClick={() => setModalOpen(false)}></div>
            <UserAddressMap
              officeLatLng={officeLatLng}
              addressPosition={latlng}
              mapVersion={mapVersion}
              submitFunction={addLatLng}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default AddressesFormField;
