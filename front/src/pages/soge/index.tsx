import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import HttpClient from "@/adapter/HttpClient";
import moment from "moment";
import { loader } from "@/component/Widgets/Loader";

import TableArea from "@/component/soge/Index/TableArea";
import TourismTableArea from "@/component/soge/Tourism/TableArea";
import isValidDate from "@/component/Widgets/isValidDate";
import {
  SuccessToast,
  ErrorToast,
} from "@/component/ReactHotToast/ToastMessage";

// context
import { useUser } from "@/contexts/UserContext";

// types
import SuccessResponse from "@/types/ApiResponse/success";

// font awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt, faUpload } from "@fortawesome/free-solid-svg-icons";

const SogesPage = () => {
  const router = useRouter();
  const paramsDate = router.query.date as string | undefined;
  const httpClient = new HttpClient();
  const { category, officeName } = useUser();

  const [date, setDate] = useState<string>(
    isValidDate(paramsDate) ? paramsDate! : moment().format("YYYY-MM-DD")
  );
  const [shareKey, setShareKey] = useState(0);

  // クエリパラメータが変更された時（ブラウザバック等）
  useEffect(() => {
    if (
      router.query.date &&
      isValidDate(router.query.date as string) &&
      router.query.date !== date
    ) {
      setDate(router.query.date as string);
    }
  }, [router.query.date]);

  // フォームで日付が変更された時
  useEffect(() => {
    if (date && date !== router.query.date && isValidDate(date)) {
      router.push(`/soge?date=${date}`, undefined, { shallow: true });
    }
  }, [date]);

  const onSubmit = () => {
    loader.startLoading();

    const url = "/data_uploads";
    const params = {
      date: date,
    };
    httpClient
      .post<SuccessResponse>(url, params)
      .then((res) => {
        SuccessToast(res.data.messages);
        setShareKey((prev) => prev + 1);
        loader.stopLoading();
      })
      .catch((error) => {
        const errorData = error.response?.data;

        if (errorData?.full_messages) {
          errorData.full_messages.forEach((message: string) => {
            ErrorToast(message);
          });
        }
        loader.stopLoading();
      });
  };

  return (
    <div id="contents">
      <section>
        <div className="headSCT">
          <div className="cont">
            <h1>
              <FontAwesomeIcon icon={faCalendarAlt} />
              送迎一覧
            </h1>
            {officeName && (
              <div className="officeNameDisplay">
                {officeName}
              </div>
            )}
          </div>
        </div>
      </section>
      {category === "tourism" ? (
        <TourismTableArea date={date} setDate={setDate} shareKey={shareKey} onSubmit={onSubmit} />
      ) : (
        <TableArea date={date} setDate={setDate} shareKey={shareKey} onSubmit={onSubmit} />
      )}
    </div>
  );
};

export default SogesPage;
