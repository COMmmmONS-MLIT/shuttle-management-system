import React from "react";
import Link from "next/link";
import OfficeForm from "@/component/office/Form";

// font awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClipboardCheck,
  faClipboardList,
} from "@fortawesome/free-solid-svg-icons";


const NewOfficesPage = () => {
  return (
    <div id="contents">
      <section>
        <div className="headSCT">
          <div className="cont">
            <h1>
              <FontAwesomeIcon icon={faClipboardCheck} />
              事業所登録
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

      <OfficeForm />
    </div>
  );
};

export default NewOfficesPage;
