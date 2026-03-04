import React from "react";
import { useRouter } from "next/router";
import { useState } from "react";
import HttpClient from "@/adapter/HttpClient";
import CarForm from "@/component/car/Form";
import moment from "moment";

// types
import { Car } from "@/types/car";
import { CarPattern } from "@/types/carPattern";
import { SuccessToast } from "@/component/ReactHotToast/ToastMessage";
import { ApiErrorHandler } from "@/services/apiErrorHandler";

const defaultCarFormValue = {
  id: undefined,
  number: "",
  name: "",
  max_seat: 0,
  max_wc_seat: 0,
  cargo_volume: 0,
  car_pattern_name: "",
  stopped: false,
  created_at: moment().endOf("month").format("YYYY-MM-DD"),
};

const defaultCarPatternFormValue = {
  id: undefined,
  name: "",
  car_type: "",
  restriction_ids: [],
  wc_numbers: [
    {
      id: 0,
      cargo_volume: 0,
      normal_seat: 0,
      wc_seat: 0,
    },
  ],
};

const NewCarsPage = () => {
  const httpClient = new HttpClient();
  const router = useRouter();
  const [carForm, setCarForm] = useState<Car>(defaultCarFormValue);
  const [carPatternForm, setCarPatternForm] = useState<CarPattern>(
    defaultCarPatternFormValue
  );
  const [carFormErrorMessages, setCarFormErrorMessages] = useState<any>({});

  const createdCar = () => {
    const url = "/cars";
    const params = {
      car: {
        ...carForm,
        pattern: carPatternForm,
      },
    };

    httpClient
      .post<{ messages: string }>(url, params)
      .then((res) => {
        SuccessToast(res.data.messages);
        router.push("/cars");
      })
      .catch((error) => {
        const errorMessages = new ApiErrorHandler(error).getErrorMessages();
        setCarFormErrorMessages(errorMessages);
      });
  };

  return (
    <CarForm
      httpClient={httpClient}
      router={router}
      carForm={carForm}
      setCarForm={setCarForm}
      carPatternForm={carPatternForm}
      setCarPatternForm={setCarPatternForm}
      carFormErrorMessages={carFormErrorMessages}
      submitFunction={createdCar}
    />
  );
};

export default NewCarsPage;
