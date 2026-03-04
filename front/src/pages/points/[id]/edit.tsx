import React from "react";
import { useRouter } from "next/router";
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

const EditPoint = () => {
  const router = useRouter();
  const id = router.query.id as string;
  const { officeName } = useUser();

  return (
    <div id="contents">
      <section>
        <div className="headSCT">
          <div className="cont">
            <h1>
              <FontAwesomeIcon icon={faClipboardCheck} />
              地点編集
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

      <PointForm id={id} />
    </div>
  );
};

export default EditPoint;
