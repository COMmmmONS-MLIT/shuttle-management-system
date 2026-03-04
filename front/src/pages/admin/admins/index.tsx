import React, { useState, useEffect } from "react";
import HttpClient from "@/adapter/HttpClient";
import Link from "next/link";

// font awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClipboardList,
  faNotesMedical,
} from "@fortawesome/free-solid-svg-icons";

type AdminAccount = {
  id: number;
  email: string;
};

type ResponseAdminAccountsData = {
  admins: AdminAccount[];
};

const AdminAccountsPage = () => {
  const httpClient = new HttpClient();
  const [accounts, setAccounts] = useState<AdminAccount[]>([]);

  useEffect(() => {
    httpClient
      .get<ResponseAdminAccountsData>("/admin/admins")
      .then((response) => {
        setAccounts(response.data.admins ?? []);
      })
      .catch(() => {
        setAccounts([]);
      });
  }, []);

  return (
    <div id="contents">
      <section>
        <div className="headSCT">
          <div className="cont">
            <h1>
              <FontAwesomeIcon icon={faClipboardList} />
              管理者アカウント一覧
            </h1>
            <ul className="button">
              <li>
                <Link href="/admin/admins/new">
                  <FontAwesomeIcon icon={faNotesMedical} />
                  アカウント登録
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section>
        <div className="userSCT">
          <div className="cont">
            <div className="tablehead">
              <Link href="/admin/admins/new">
                <button type="button">
                  <FontAwesomeIcon icon={faNotesMedical} />
                  アカウント登録
                </button>
              </Link>
            </div>
            <div className="viewport js-scroll">
              <table className="userTable">
                <thead>
                  <tr>
                    <th>アカウントID</th>
                    <th>メールアドレス</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map((account, index) => (
                    <tr key={index}>
                      <td>{account.id}</td>
                      <td>{account.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="tablefoot" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminAccountsPage;
