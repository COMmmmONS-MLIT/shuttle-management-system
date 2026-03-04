import React from "react";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import HttpClient from "@/adapter/HttpClient";
import CarForm from "@/component/car/Form";
import RemoveEmptyParams from "@/component/Widgets/RemoveEmptyParams";
import { SuccessToast } from "@/component/ReactHotToast/ToastMessage";

// types
import { Car } from "@/types/car";
import { ResponseCarData } from "@/types/ApiResponse/car";
import { CarPattern } from "@/types/carPattern";
import { ApiErrorHandler } from "@/services/apiErrorHandler";

const defaultCarFormValue = {
  number: "",
  name: "",
  max_seat: 0,
  max_wc_seat: 0,
  stopped: false,
  cargo_volume: 0,
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


const EditCarsPage = () => {
  const { id } = useRouter().query;

  const httpClient = new HttpClient();
  const router = useRouter();
  const [carForm, setCarForm] = useState<Car>(defaultCarFormValue);
  const [carPatternForm, setCarPatternForm] = useState<CarPattern>(
    defaultCarPatternFormValue
  );
  const [carFormErrorMessages, setCarFormErrorMessages] = useState<any>({});

  useEffect(() => {
    fetchCar();
  }, []);

  const fetchCar = () => {
    const url = `/cars/${id}`;
    httpClient
      .get<ResponseCarData>(url)
      .then((res) => {
        setCarForm(res.data.car);
        setCarPatternForm(res.data.car_pattern);
      });
  };

  const updatedCar = () => {
    const url = `/cars/${id}`;
    const patternParams = RemoveEmptyParams(carPatternForm);
    const params = {
      car: {
        ...carForm,
        pattern: patternParams,
      },
      stop: stop,
    };

    httpClient
      .put<{ messages: string }>(url, params)
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
      submitFunction={updatedCar}
    />
  );
};

export default EditCarsPage;
