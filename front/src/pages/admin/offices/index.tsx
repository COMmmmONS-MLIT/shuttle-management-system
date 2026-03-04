import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import HttpClient from "@/adapter/HttpClient";
import Link from "next/link";
import { ErrorToast } from "@/component/ReactHotToast/ToastMessage";

// Types
import { Office } from "@/types/office";
import { ResponseOfficesData } from "@/types/ApiResponse/office";

// FontAwesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClipboardList,
  faNotesMedical,
} from "@fortawesome/free-solid-svg-icons";


const OfficesPage = () => {
  const router = useRouter();
  const httpClient = new HttpClient();
  const [offices, setOffices] = useState<Office[]>([]);

  useEffect(() => {
    fetchOffices();
  }, []);

  const fetchOffices = () => {
    httpClient
      .get<ResponseOfficesData>("/admin/offices")
      .then((response) => {
        if (response.data.offices) {
          setOffices(response.data.offices);
        } else {
          ErrorToast("該当するデータがありません");
          setOffices([]);
        }
      });
  };

  const setCookieAndRedirect = (office: Office) => {
    httpClient
      .put(`/admin/offices/${office.id}/set_tenant_cd`)
      .then((res) => {
        router.push("/");
      });
  };

  return (
    <div id="contents">
      <section>
        <div className="headSCT">
          <div className="cont">
            <h1>
              <FontAwesomeIcon icon={faClipboardList} />
              事業所一覧
            </h1>
            <ul className="button">
              <li>
                <Link href="/admin/offices/new">
                  <FontAwesomeIcon icon={faNotesMedical} />
                  事業所登録
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </section>
      <section>
        <div className="officeSCT">
          <div className="cont">
            <div className="viewport js-scroll">
              <table className="userTable">
                <thead>
                  <tr>
                    <th>事業所名</th>
                    <th>住所</th>
                    <th>更新日時</th>
                    <th>作成日時</th>
                    <th>アカウント数</th>
                  </tr>
                </thead>
                <tbody>
                  {offices.map((office, i) => (
                    <tr key={i}>
                      <td>
                        <p>
                          <Link href="">{office.name}</Link>
                        </p>
                        <ul>
                          <li>
                            <a
                              onClick={() => setCookieAndRedirect(office)}
                              className="dashboard"
                              style={{ cursor: "pointer" }}
                            >
                              ダッシュボード
                            </a>
                          </li>
                          <li>
                            <Link
                              href={`/admin/offices/${office.id}/edit`}
                              className="edit"
                            >
                              編集
                            </Link>
                          </li>
                        </ul>
                      </td>
                      <td>{office.address}</td>
                      <td>{office.updated_at}</td>
                      <td>{office.created_at}</td>
                      <td>
                        <Link href={`/admin/offices/${office.id}/accounts`}>
                          {office.user_count}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default OfficesPage;
