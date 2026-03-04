import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import HttpClient from "@/adapter/HttpClient";
import CustomerForm from "@/component/customers/Form";
import { ErrorToast } from "@/component/ReactHotToast/ToastMessage";

// font awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClipboardCheck } from "@fortawesome/free-solid-svg-icons";

// types
import { Address } from "@/types/address";
import { Customer, UseCase } from "@/types/customer";
import { ResponseCustomer } from "@/types/ApiResponse/customer";

// context
import { useUser } from "@/contexts/UserContext";

const defaultCustomerFormValue = {
  cd: "",
  name: "",
  name_kana: "",
  contract_status: undefined,
  wc: 0,
  walker: 0,
  walker_size: undefined,
  need_helper: 0,
  seat_assignment: "",
  default_pick_up_point_order: undefined,
  default_drop_off_point_order: undefined,
  car_restriction_id: undefined,
  departure_time: "",
  arrival_time: "",
  start_time: "",
  self_pick_up: false,
  self_drop_off: false,
  walking_note: "",
  common_note: "",
  pick_up_note: "",
  drop_off_note: "",
  stopped_at: "",
  stopped_reason: "",
  image: "",
};
const defaultAddressFormValue = [
  {
    order: 1,
    address_label: "",
    postal_code: "",
    address: "",
    room_name: "",
    phone_number: "",
    lat: undefined,
    lng: undefined,
    parking_lat: undefined,
    parking_lng: undefined,
    distance: undefined,
    time: undefined,
    wait_time: undefined,
    acceptance_rate: undefined,
    car_restriction_id: undefined,
  },
];

const defaultUseCaseFormValue = [
  {
    customer_id: undefined,
    day_of_week: "sunday",
    departure_time: "",
    pick_up_point_order: undefined,
    start_time: "",
    arrival_time: "",
    drop_off_point_order: undefined,
    self_pick_up: false,
    self_drop_off: false,
    active: false,
    drop_off_request: false,
    pick_up_request: false,
  },
  {
    customer_id: undefined,
    day_of_week: "monday",
    departure_time: "",
    pick_up_point_order: undefined,
    start_time: "",
    arrival_time: "",
    drop_off_point_order: undefined,
    self_pick_up: false,
    self_drop_off: false,
    active: false,
    drop_off_request: false,
    pick_up_request: false,
  },
  {
    customer_id: undefined,
    day_of_week: "tuesday",
    departure_time: "",
    pick_up_point_order: undefined,
    start_time: "",
    arrival_time: "",
    drop_off_point_order: undefined,
    self_pick_up: false,
    self_drop_off: false,
    active: false,
    drop_off_request: false,
    pick_up_request: false,
  },
  {
    customer_id: undefined,
    day_of_week: "wednesday",
    departure_time: "",
    pick_up_point_order: undefined,
    start_time: "",
    arrival_time: "",
    drop_off_point_order: undefined,
    self_pick_up: false,
    self_drop_off: false,
    active: false,
    drop_off_request: false,
    pick_up_request: false,
  },
  {
    customer_id: undefined,
    day_of_week: "thursday",
    departure_time: "",
    pick_up_point_order: undefined,
    start_time: "",
    arrival_time: "",
    drop_off_point_order: undefined,
    self_pick_up: false,
    self_drop_off: false,
    active: false,
    drop_off_request: false,
    pick_up_request: false,
  },
  {
    customer_id: undefined,
    day_of_week: "friday",
    departure_time: "",
    pick_up_point_order: undefined,
    start_time: "",
    arrival_time: "",
    drop_off_point_order: undefined,
    self_pick_up: false,
    self_drop_off: false,
    active: false,
    drop_off_request: false,
    pick_up_request: false,
  },
  {
    customer_id: undefined,
    day_of_week: "saturday",
    departure_time: "",
    pick_up_point_order: undefined,
    start_time: "",
    arrival_time: "",
    drop_off_point_order: undefined,
    self_pick_up: false,
    self_drop_off: false,
    active: false,
    drop_off_request: false,
    pick_up_request: false,
  },
];


const UserEditPage = () => {
  const router = useRouter();
  const id = router.query.id as string;
  const httpClient = new HttpClient();
  const { officeName } = useUser();
  const [customerForm, setCustomerForm] = useState<Customer>(
    defaultCustomerFormValue
  );
  const [addresses, setAddresses] = useState<Address[]>(
    defaultAddressFormValue
  );
  const [useCaseForm, setUseCaseForm] = useState<UseCase[]>(
    defaultUseCaseFormValue
  );
  const [user, setUser] = useState<{ email: string } | undefined>(undefined);

  useEffect(() => {
    if (id) {
      fetchUser(id);
    }
  }, []);

  const fetchUser = (id: string) => {
    const url = `/customers/${id}`;
    httpClient
      .get<ResponseCustomer>(url)
      .then((response) => {
        if (response.data) {
          setCustomerForm(response.data.customer);
          setAddresses(response.data.addresses);
          setUseCaseForm(response.data.use_cases);
          // user情報が存在する場合、userオブジェクトを設定
          if (response.data.customer.user?.email) {
            setUser(response.data.customer.user);
          }
        } else {
          ErrorToast("該当する利用者データがありません");
          router.push("/customers");
        }
      });
  };

  return (
    <div id="contents">
      <section>
        <div className="headSCT">
          <div className="cont">
            <h1>
              <FontAwesomeIcon icon={faClipboardCheck} />
              利用者登録
            </h1>
            <ul className="button">
              <li>
                <Link href="/customers">
                  <FontAwesomeIcon icon={faClipboardCheck} />
                  利用者一覧
                </Link>
              </li>
              {/* <li>
                <Link href="/users/reports">
                  <FontAwesomeIcon icon={faHistory} />
                  利用者履歴
                </Link>
              </li>
              <li>
                <Link href="/users/relationships">
                  <FontAwesomeIcon icon={faExclamationTriangle} />
                  乗り合わせ設定
                </Link>
              </li> */}
            </ul>
            {officeName && (
              <div className="officeNameDisplay">
                {officeName}
              </div>
            )}
          </div>
        </div>
      </section>

      <CustomerForm
        customerForm={customerForm}
        setCustomerForm={setCustomerForm}
        addresses={addresses}
        setAddresses={setAddresses}
        useCaseForm={useCaseForm}
        setUseCaseForm={setUseCaseForm}
        id={id}
        user={user}
      />
    </div>
  );
};

export default UserEditPage;
