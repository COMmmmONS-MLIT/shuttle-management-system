import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import moment from "moment";

import RequestedTableArea from "@/component/soge/Index/Requested/RequestedTableArea";
import isValidDate from "@/component/Widgets/isValidDate";

// font awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt } from "@fortawesome/free-solid-svg-icons";

// context
import { useUser } from "@/contexts/UserContext";

const RequestedSogesPage = () => {
  const router = useRouter();
  const paramsDate = router.query.date as string | undefined;
  const { officeName } = useUser();

  const [date, setDate] = useState<string>(
    isValidDate(paramsDate) ? paramsDate! : moment().format("YYYY-MM-DD")
  );

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
      router.push(`/soge/requested?date=${date}`, undefined, { shallow: true });
    }
  }, [date]);

  return (
    <div id="contents">
      <section>
        <div className="headSCT">
          <div className="cont">
            <h1>
              <FontAwesomeIcon icon={faCalendarAlt} />
              送迎一覧（委託）
            </h1>
            {officeName && (
              <div className="officeNameDisplay">
                {officeName}
              </div>
            )}
          </div>
        </div>
      </section>
      <RequestedTableArea date={date} setDate={setDate} />
    </div>
  );
};

export default RequestedSogesPage;
