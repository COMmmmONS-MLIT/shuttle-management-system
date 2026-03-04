import React, { useEffect, useState } from "react";
import CustomerFormField from "@/component/customers/CustomerFormField";
import UserInfoField from "@/component/customers/UserInfoField";
import AddressesFormField from "@/component/customers/AddressesFormField";
import OptionsForm from "@/component/customers/OptionsForm";
import UseCaseForm from "@/component/customers/UseCaseForm";
import PauseStopForm from "@/component/customers/PauseStopForm";
import HttpClient from "@/adapter/HttpClient";
import { useRouter } from "next/router";
import { SuccessToast } from "../ReactHotToast/ToastMessage";

//types
import { Address } from "@/types/address";
import { Customer, UseCase } from "@/types/customer";
import { ResponseCarRestrictions } from "@/types/ApiResponse/carRestriction";
import { ResponseOfficeLatLng } from "@/types/ApiResponse/customer";

//font awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUndoAlt, faSave, faPlus } from "@fortawesome/free-solid-svg-icons";

import { ApiErrorHandler } from "@/services/apiErrorHandler";

// context
import { useUser } from "@/contexts/UserContext";

const defaultAddressFormValue = {
  order: undefined,
  postal_code: "",
  address_label: "",
  address: "",
  room_name: "",
  phone_number: "",
  phone_memo: "",
  lat: undefined,
  lng: undefined,
  parking_lat: undefined,
  parking_lng: undefined,
  wait_time: undefined,
  distance: undefined,
  time: undefined,
  car_restriction_id: undefined,
  acceptance_rate: undefined,
  remarks: "",
};

type Props = {
  customerForm: Customer;
  setCustomerForm: React.Dispatch<React.SetStateAction<Customer>>;
  addresses: Address[];
  setAddresses: React.Dispatch<React.SetStateAction<Address[]>>;
  useCaseForm: UseCase[];
  setUseCaseForm: React.Dispatch<React.SetStateAction<UseCase[]>>;
  id?: string;
  user?: { email: string };
};

const CustomerForm = ({
  customerForm,
  setCustomerForm,
  addresses,
  setAddresses,
  useCaseForm,
  setUseCaseForm,
  id = "",
  user,
}: Props) => {
  const { category } = useUser();
  const httpClient = new HttpClient();
  const router = useRouter();
  const [carRestrictionsOptions, setCarRestrictionsOptions] = useState<
    { label: string; value: number }[]
  >([]);
  const [officeLatLng, setOfficeLatLng] = useState<{
    lat: number;
    lng: number;
  }>({ lat: 35.681236, lng: 139.767125 });
  const [customerFormErrorMessages, setCustomerFormErrorMessages] = useState(
    {}
  );

  useEffect(() => {
    fetchOfficeLatLng();
    fetchCarRestrictions();
  }, []);

  const fetchOfficeLatLng = () => {
    const url = "/customers/office_latlng";
    httpClient
      .get<ResponseOfficeLatLng>(url)
      .then((response: { data: { office_latlng: { lat: any; lng: any } } }) => {
        const lat = Number(response.data.office_latlng.lat);
        const lng = Number(response.data.office_latlng.lng);
        setOfficeLatLng({ lat, lng });
      });
  };

  const fetchCarRestrictions = () => {
    const url = "/car_restrictions";
    httpClient
      .get<ResponseCarRestrictions>(url)
      .then((response: { data: { car_restrictions: any[] } }) => {
        const carRestrictions = response.data.car_restrictions.map(
          (restriction: { name: any; id: any }) => {
            return { label: restriction.name, value: restriction.id };
          }
        );
        setCarRestrictionsOptions(carRestrictions);
      });
  };

  const addAddress = () => {
    const order = addresses.length + 1;
    const address = {
      ...defaultAddressFormValue,
      order: order,
    };
    setAddresses((prev: any) => [...prev, address]);
  };

  const addressOptions = [{ label: "-----", value: "" }].concat(
    addresses.map((address) => {
      return {
        label: address.address_label
          ? address.address_label
          : `地点(${address.order})`,
        value: String(address.order),
      };
    })
  );

  const submitCustomer = async () => {
    try {
      const customer_params = {
        customer: customerForm,
        addresses: addresses,
        use_cases: useCaseForm,
      };
      if (id) {
        await httpClient.put(`/customers/${id}`, {
          customer_params: customer_params,
        });

        SuccessToast(`${customerForm.name}さんを更新しました`);
      } else {
        await httpClient.post("/customers", {
          customer_params: customer_params,
        });
        SuccessToast(`${customerForm.name}さんを登録しました`);
      }
      router.push("/customers");
    } catch (error: any) {
      const errorMessages = new ApiErrorHandler(error).getErrorMessages();
      setCustomerFormErrorMessages(errorMessages);
    }
  };

  return (
    <section>
      <div className="inputSCT">
        <div className="cont">
          <div className="inputbox">
            <CustomerFormField
              customerForm={customerForm}
              setCustomerForm={setCustomerForm}
              carRestrictionsOptions={carRestrictionsOptions}
              id={id}
              errorMessages={customerFormErrorMessages}
              user={user}
            />
            {user && <UserInfoField user={user} />}
            {addresses.map((address, index) => (
              <AddressesFormField
                key={index}
                address={address}
                index={index}
                setAddresses={setAddresses}
                carRestrictionsOptions={carRestrictionsOptions}
                officeLatLng={officeLatLng}
                id={id}
                errorMessages={customerFormErrorMessages}
              />
            ))}
            <div className="set flex">
              <button
                type="button"
                className="subsub js-addbutton"
                onClick={() => addAddress()}
              >
                <FontAwesomeIcon icon={faPlus} />
                送迎地点を追加する
              </button>
            </div>
            {category === "welfare" && (
              <OptionsForm
                customerForm={customerForm}
                setCustomerForm={setCustomerForm}
              />
            )}
            <UseCaseForm
              useCaseForm={useCaseForm}
              setUseCaseForm={setUseCaseForm}
              addressOptions={addressOptions}
              customerForm={customerForm}
              setCustomerForm={setCustomerForm}
              errorMessages={customerFormErrorMessages}
            />

            {id && (
              <>
                {/* <RelationshipsForm id={id} /> */}
                <PauseStopForm
                  customerForm={customerForm}
                  setCustomerForm={setCustomerForm}
                />
              </>
            )}
            <div className="submitbox">
              <button type="button" aria-label="戻る" className="sub">
                <FontAwesomeIcon
                  icon={faUndoAlt}
                  onClick={() => router.push("/customers")}
                />
                戻る
              </button>
              <button type="button" aria-label="登録" onClick={submitCustomer}>
                <FontAwesomeIcon icon={faSave} />
                登録
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CustomerForm;
