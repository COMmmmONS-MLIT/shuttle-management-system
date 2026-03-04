import React, { useEffect, useState } from "react";
import Link from "next/link";
import InputField from "@/component/FormControls/InputField";
import CheckboxField from "@/component/FormControls/CheckboxField";
import SelectField from "@/component/FormControls/SelectField";
import HttpClient from "@/adapter/HttpClient";
import { useRouter } from "next/router";
import {
  SuccessToast,
  ErrorToast,
} from "@/component/ReactHotToast/ToastMessage";
import OfficeAddressMap from "@/component/GoogleMap/OfficeAddressMap";
import { GeocodingService } from "@/services/geocoding";

import { Office } from "@/types/office";
import { ResponseOfficesData } from "@/types/ApiResponse/office";
import { ResponseOfficeShow } from "@/types/ApiResponse/office";
import { SelectOption } from "@/types/FormControll/selectOption";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBuilding,
  faBuildingUser,
  faMapMarker,
  faUndoAlt,
  faSave,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";

const defaultOfficeFormValue = {
  cd: "",
  tenant_cd: "",
  name: "",
  name_kana: "",
  address: "",
  postcode: "",
  tel: "",
  fax: "",
  mail: "",
  contact_person_name: "",
  contact_person_kana: "",
  lat: undefined,
  lng: undefined,
  is_active: false,
  only_schedule_create: false,
  category: "welfare",
  created_at: null,
  updated_at: null,
};

const categoryOptions = [
  { label: "福祉", value: "welfare" },
  { label: "観光", value: "tourism" },
  { label: "教育", value: "education" },
];

type Props = {
  id?: string;
};

const OfficeForm = ({ id }: Props) => {
  const httpClient = new HttpClient();
  const geocodingService = new GeocodingService(httpClient);
  const router = useRouter();
  const [office, setOffice] = useState<Office>(defaultOfficeFormValue);
  const [officeOptions, setOfficeOptions] = useState<SelectOption[]>([]);
  const [acceptOfficeIds, setAcceptOfficeIds] = useState<number[]>([]);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [mapVersion, setMapVersion] = useState<number>(0);
  const [selectedPosition, setSelectedPosition] = useState<{
    lat: number;
    lng: number;
  }>(() => {
    if (office?.lat && office?.lng) {
      return { lat: office.lat, lng: office.lng };
    }
    return { lat: 35.681236, lng: 139.767125 };
  });

  useEffect(() => {
    if (id) {
      fetchOffice(id);
    }
  }, [id]);

  useEffect(() => {
    fetchOfficeOptions();
  }, [office?.category]);

  useEffect(() => {
    if (office?.lat && office?.lng) {
      setSelectedPosition({ lat: office.lat, lng: office.lng });
    }
  }, [office?.lat, office?.lng]);

  const fetchOfficeOptions = () => {
    httpClient.get<ResponseOfficesData>("/admin/offices").then((response) => {
      if (response.data.offices) {
        // tourismの場合はtourismのみ、それ以外はtourism以外をフィルター
        const filteredOffices = response.data.offices.filter((o) =>
          office?.category === "tourism"
            ? o.category === "tourism"
            : o.category !== "tourism",
        );
        const officeOptions = filteredOffices
          .map((o) => ({
            label: o.name,
            value: o.id,
          }))
          .filter((option) => String(option.value) !== id);
        setOfficeOptions(officeOptions);
        if (office?.accept_office_ids) {
          setOffice((prev) => ({
            ...prev,
            accept_office_ids: acceptOfficeIds.filter((acceptId) =>
              filteredOffices.some((o) => o.id === acceptId),
            ),
          }));
        }
      } else {
        ErrorToast("該当するデータがありません");
        setOfficeOptions([]);
        setOffice((prev) => ({ ...prev, accept_office_ids: [] }));
      }
    });
  };

  const onCheckedAcceptOffice = (id: number) => {
    setOffice((prev) => {
      const currentIds = prev.accept_office_ids || [];

      const updatedIds = currentIds.includes(id)
        ? currentIds.filter((item) => item !== id)
        : [...currentIds, id];

      return {
        ...prev,
        accept_office_ids: updatedIds,
      };
    });
  };

  const fetchOffice = (id: string) => {
    const url = `/admin/offices/${id}`;
    httpClient
      .get<ResponseOfficeShow>(url)
      .then((response) => {
        if (response.data) {
          setOffice(response.data.office);
          setAcceptOfficeIds(response.data.office.accept_office_ids || []);
        } else {
          ErrorToast("該当するデータがありません");
          setOffice(defaultOfficeFormValue);
          router.push("/admin/offices");
        }
      })
      .catch((error) => {
        setOffice(defaultOfficeFormValue);
      });
  };

  const handleGeocoding = async () => {
    if (!office.address) {
      ErrorToast("住所を入力してください");
      return;
    }

    try {
      const result = await geocodingService.getCoordinatesFromAddress(
        office.address,
      );

      setOffice((prev) => ({
        ...prev,
        address: prev.address,
        postcode:
          prev.postcode !== result.postcode
            ? result.postcode || ""
            : prev.postcode,
        lat: result.lat,
        lng: result.lng,
      }));
      SuccessToast("住所情報を取得しました");
    } catch (error) {
      ErrorToast("住所情報の取得に失敗しました");
    }
  };

  const handleSubmit = async () => {
    try {
      const officeForRequest = {
        ...office,
        tel: removeHyphen(office.tel),
        fax: removeHyphen(office.fax),
      };

      // updated_atを削除
      const { updated_at, ...officeWithoutUpdatedAt } = officeForRequest;

      const requestBody = { office: officeWithoutUpdatedAt };

      if (id) {
        await httpClient.put(`/admin/offices/${id}`, requestBody);
        SuccessToast(`${office.name}を更新しました`);
      } else {
        await httpClient.post("/admin/offices", requestBody);
        SuccessToast(`${office.name}を登録しました`);
      }
      router.push("/admin/offices");
    } catch (error: any) {
      error.response.data.full_messages.forEach((message: string) => {
        ErrorToast(message);
      });
    }
  };

  const removeHyphen = (value: string | undefined): string => {
    if (!value) return "";
    return value.replace(/-/g, "");
  };

  return (
    <section>
      <div className="inputSCT">
        <div className="cont">
          {id && office?.updated_at && (
            <ul className="dateList">
              <li>更新日：{office.updated_at}</li>
            </ul>
          )}
          <div className="inputbox">
            <div className="set">
              <div className="head">
                <h2>
                  <FontAwesomeIcon icon={faBuilding} />
                  事業所
                </h2>
              </div>
              <fieldset className="basic flex">
                <InputField
                  readOnly={Boolean(id)}
                  name="cd"
                  label="事業所番号"
                  type="text"
                  labelClassName="text"
                  inputClassName="middle"
                  setState={setOffice}
                  value={office?.cd}
                />
                <InputField
                  name="tenant_cd"
                  label="事業所コード"
                  type="text"
                  labelClassName="text"
                  inputClassName="middle"
                  setState={setOffice}
                  value={office?.tenant_cd}
                />
                <div className="spacer"></div>
                <InputField
                  name="name"
                  label="事業所名"
                  type="text"
                  labelClassName="text"
                  inputClassName="middle"
                  setState={setOffice}
                  value={office?.name}
                />
                <InputField
                  name="name_kana"
                  label="事業所（カナ）"
                  type="text"
                  labelClassName="text"
                  inputClassName="middle"
                  setState={setOffice}
                  value={office?.name_kana}
                />
                <div className="spacer"></div>
                <InputField
                  name="postcode"
                  label="〒"
                  type="text"
                  labelClassName="text"
                  inputClassName="middle"
                  setState={setOffice}
                  value={office?.postcode}
                />
                <InputField
                  name="address"
                  label="住所"
                  type="text"
                  labelClassName="text"
                  inputClassName="long"
                  setState={setOffice}
                  value={office?.address}
                />
                <button type="button" onClick={handleGeocoding} className="">
                  <FontAwesomeIcon icon={faSearch} />
                  API取得
                </button>
                <div className="spacer"></div>
                <InputField
                  name="tel"
                  label="TEL"
                  type="tel"
                  labelClassName="tel"
                  inputClassName="middle"
                  setState={setOffice}
                  value={office?.tel}
                />
                <InputField
                  name="fax"
                  label="FAX"
                  type="tel"
                  labelClassName="tel"
                  inputClassName="middle"
                  setState={setOffice}
                  value={office?.fax}
                />
                <InputField
                  name="mail"
                  label="Mail"
                  type="email"
                  labelClassName="email"
                  inputClassName="middle"
                  setState={setOffice}
                  value={office?.mail}
                />
                <div className="spacer"></div>
                <InputField
                  name="contact_person_name"
                  label="担当者"
                  type="text"
                  labelClassName="text"
                  inputClassName="middle"
                  setState={setOffice}
                  value={office?.contact_person_name}
                />
                <InputField
                  name="contact_person_kana"
                  label="担当者（カナ）"
                  type="text"
                  labelClassName="text"
                  inputClassName="middle"
                  setState={setOffice}
                  value={office?.contact_person_kana}
                />
                <SelectField
                  name="category"
                  label="事業所カテゴリ"
                  options={categoryOptions}
                  setState={setOffice}
                  value={office?.category}
                />
                <div className="spacer"></div>
                <SelectField
                  name="only_schedule_create"
                  label="送迎表作成のみ"
                  options={[
                    { label: "はい", value: "true" },
                    { label: "いいえ", value: "false" },
                  ]}
                  setState={setOffice}
                  value={
                    String(office?.only_schedule_create) == "true"
                      ? "true"
                      : "false"
                  }
                />
              </fieldset>
            </div>
            <div className="set">
              <div className="head">
                <h2>
                  <FontAwesomeIcon icon={faMapMarker} />
                  <span className="js-point-txt">地点</span>
                </h2>
                <button type="button" onClick={() => setModalOpen(true)}>
                  <FontAwesomeIcon icon={faMapMarker} />
                  地点登録
                </button>
              </div>
              <fieldset className="point flex">
                <InputField
                  name="lat"
                  label="緯度"
                  type="number"
                  labelClassName="text"
                  inputClassName="middle"
                  setState={setOffice}
                  value={office?.lat || ""}
                />
                <InputField
                  name="lng"
                  label="経度"
                  type="number"
                  labelClassName="text"
                  inputClassName="middle"
                  setState={setOffice}
                  value={office?.lng || ""}
                />
              </fieldset>
            </div>
            <div className="set">
              <div className="head">
                <h2>
                  <FontAwesomeIcon icon={faBuildingUser} />
                  <span className="js-point-txt">送迎依頼先事業所</span>
                </h2>
              </div>
              <fieldset className="point flex">
                {officeOptions.map((officeOption, i) => (
                  <label key={i} className="checkbox">
                    <input
                      type="checkbox"
                      onChange={() =>
                        onCheckedAcceptOffice(officeOption.value as number)
                      }
                      checked={office.accept_office_ids?.includes(
                        officeOption.value as number,
                      )}
                    />
                    <span>{officeOption.label}</span>
                  </label>
                ))}
              </fieldset>
            </div>
            <div className="submitbox">
              <Link href="/admin/offices">
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
      {modalOpen && (
        <div className="modalSCT active">
          <div className="mask"></div>
          <div className="cont">
            <div className="close" onClick={() => setModalOpen(false)}></div>
            <OfficeAddressMap
              officePosition={{ lat: 35.681236, lng: 139.767125 }}
              addressPosition={selectedPosition}
              mapVersion={mapVersion}
              submitFunction={(lat, lng) => {
                setOffice((prev) => ({
                  ...prev,
                  lat,
                  lng,
                }));
                setModalOpen(false);
              }}
            />
          </div>
        </div>
      )}
    </section>
  );
};

export default OfficeForm;
