import React from "react";
import Link from "next/link";
import OfficeForm from "@/component/office/Form";
import { useRouter } from "next/router";

// font awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClipboardCheck,
  faClipboardList,
} from "@fortawesome/free-solid-svg-icons";


const EditOfficesPage = () => {
  const router = useRouter();
  const id = router.query.id as string;

  return (
    <div id="contents">
      <section>
        <div className="headSCT">
          <div className="cont">
            <h1>
              <FontAwesomeIcon icon={faClipboardCheck} />
              事業所編集
            </h1>
            <ul className="button">
              <li>
                <Link href="/admin/offices">
                  <FontAwesomeIcon icon={faClipboardList} />
                  事業所一覧
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <OfficeForm id={id} />
    </div>
  );
};

export default EditOfficesPage;
