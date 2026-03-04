import React, { useState, useEffect } from "react";
import HttpClient from "@/adapter/HttpClient";
import Link from "next/link";
import { useRouter } from "next/router";
import EditRow from "@/component/Account/EditRow";
import ListRow from "@/component/Account/ListRow";

// font awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClipboardList,
  faNotesMedical,
} from "@fortawesome/free-solid-svg-icons";

// types
import { User } from "@/types/user";
import { ResponseUsersData } from "@/types/ApiResponse/user";

const AccountsPage = () => {
  const router = useRouter();
  const { id } = router.query as { id: string };
  const tableRow = (account: User, index: number) => {
    if (account.edit) {
      return (
        <EditRow
          key={index}
          account={account}
          index={index}
          id={id}
          switchMode={switchMode}
          setAccounts={setAccounts}
          fetchUsers={fetchUsers}
        />
      );
    } else {
      return (
        <ListRow
          key={index}
          account={account}
          index={index}
          officeId={id ?? ""}
          switchMode={switchMode}
          onPasswordResetSuccess={fetchUsers}
        />
      );
    }
  };

  const switchMode = (index: number, value: boolean) => {
    const updatedAccouts = [...accounts];
    const accoutToUpdate = updatedAccouts[index];
    accoutToUpdate["edit"] = value;
    setAccounts(updatedAccouts);
  };

  const httpClient = new HttpClient();
  const [accounts, setAccounts] = useState<User[]>([]);
  const [officeName, setOfficeName] = useState<string>("");
  const [accountSearchParams, setAccountSearchParams] = useState({
    disp_no: 10,
    page_no: 1,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    const path = `/admin/offices/${id}/users`;
    httpClient
      .get<ResponseUsersData>(path, {
        params: accountSearchParams,
      })
      .then((response) => {
        setAccounts(response.data.users);
        setOfficeName(response.data.office_name);
      });
  };

  return (
    <div id="contents">
      <section>
        <div className="headSCT">
          <div className="cont">
            <h1>
              <FontAwesomeIcon icon={faClipboardList} />
              {officeName}のアカウント一覧
            </h1>
            <ul className="button">
              <li>
                <Link href={`/admin/offices`}>
                  <FontAwesomeIcon icon={faNotesMedical} />
                  事業所一覧
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* <section>
        <div className="sortSCT">
          <div className="cont">
            <div className="head">
              <h2>
                <FontAwesomeIcon icon={faFilter} />
                絞り込む
              </h2>
              <button type="button" className="sub">
                <FontAwesomeIcon icon={faUndoAlt} />
                リセット
              </button>
            </div>

            <div className="sort">
              <div>  className="searchbox">
                <fieldset>
                  <InputField
                    name=""
                    labelClassName="keyword"
                    label="アカウント名："
                    type="search"
                    setState={setAccountSearchParams}
                  />
                  <InputField
                    name=""
                    labelClassName="keyword"
                    label="アカウントID："
                    type="search"
                    setState={setAccountSearchParams}
                  />
                </fieldset>
                <fieldset>
                  <SelectField
                    name=""
                    label="事業所："
                    options={officeOptions}
                    defaultValue={accountSearchParams}
                    setState={setAccountSearchParams}
                  />
                  <SelectField
                    name=""
                    label="権限グループ："
                    options={roleOptions}
                    defaultValue={accountSearchParams}
                    setState={setAccountSearchParams}
                  />
                  <SelectField
                    name=""
                    label="ステータス："
                    options={accountStatusOptions}
                    defaultValue={accountSearchParams}
                    setState={setAccountSearchParams}
                  />
                </fieldset>
                <fieldset>
                  <SelectField
                    name=""
                    label="表示件数："
                    options={numberOptions}
                    defaultValue={accountSearchParams.disp_no}
                    setState={setAccountSearchParams}
                  />
                  <SelectField
                    name=""
                    label="表示順："
                    options={orderOptions}
                    defaultValue={accountSearchParams.page_no}
                    setState={setAccountSearchParams}
                  />
                </fieldset>
              </div>
            </div>

            <div className="submitbox">
              <button type="submit" aria-label="検索">
                <FontAwesomeIcon icon={faSearch} />
                検索
              </button>
            </div>
          </div>
        </div>
      </section> */}

      <section>
        <div className="userSCT">
          <div className="cont">
            <div className="tablehead">
              <Link href={`/admin/offices/${id}/accounts/new`}>
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
                    <th>アカウント名</th>
                    <th>メールアドレス</th>
                    <th>ステータス</th>
                    <th>権限</th>
                    <th>処理</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map((accout, index) => tableRow(accout, index))}
                </tbody>
              </table>
            </div>
            <div className="tablefoot">{/* <Pagenation /> */}</div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AccountsPage;
