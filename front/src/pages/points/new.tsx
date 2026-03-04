import React from "react";
import Link from "next/link";
import PointForm from "@/component/point/Form";

// font awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClipboardList,
  faClipboardCheck,
} from "@fortawesome/free-solid-svg-icons";

// context
import { useUser } from "@/contexts/UserContext";

const NewPoint = () => {
  const { officeName } = useUser();
  return (
    <div id="contents">
      <section>
        <div className="headSCT">
          <div className="cont">
            <h1>
              <FontAwesomeIcon icon={faClipboardCheck} />
              地点登録
            </h1>
            <ul className="button">
              <li>
                <Link href="/points">
                  <FontAwesomeIcon icon={faClipboardList} />
                  地点一覧
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

      <PointForm />
    </div>
  );
};

export default NewPoint;
