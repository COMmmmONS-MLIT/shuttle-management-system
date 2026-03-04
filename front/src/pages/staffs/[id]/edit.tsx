import React from "react";
import Link from "next/link";
import StaffForm from "@/component/staffs/Form";
import { useRouter } from "next/router";

// font awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClipboardCheck,
  faClipboardList,
} from "@fortawesome/free-solid-svg-icons";

// context
import { useUser } from "@/contexts/UserContext";


const EditStaffsPage = () => {
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
              職員編集
            </h1>
            <ul className="button">
              <li>
                <Link href="/staffs">
                  <FontAwesomeIcon icon={faClipboardList} />
                  職員一覧
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

      <StaffForm id={id} />
    </div>
  );
};

export default EditStaffsPage;
